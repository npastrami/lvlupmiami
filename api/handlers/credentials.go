package handlers

import (
    "github.com/gofiber/fiber/v2"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/utils"
    "golang.org/x/crypto/bcrypt"
    "github.com/dgrijalva/jwt-go"
    "time"
    "fmt"
	"log"
)

// Secret key for JWT signing
var secretKey = []byte("mysecretkey")

// Handler function for login
func loginHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type LoginRequest struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    var loginReq LoginRequest
    if err := c.BodyParser(&loginReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    user, err := accountDB.GetUserByUsername(loginReq.Username)
    if err != nil || user == nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    if !user.EmailVerified {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Please verify your email before logging in.",
        })
    }

    token, err := generateVerificationToken(user.Username)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating token",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Login successful",
        "token":   token,
    })
}

// Handler function to create an account
func createAccountHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type AccountRequest struct {
        Username string `json:"username"`
        Password string `json:"password"`
        Email    string `json:"email"`
    }

    var accountReq AccountRequest
    if err := c.BodyParser(&accountReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    err := accountDB.CreateUser(accountReq.Username, accountReq.Password, accountReq.Email)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error creating account",
        })
    }

    token, err := generateVerificationToken(accountReq.Username)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating verification token",
        })
    }

    verificationLink := "http://localhost:3000/api/verify_email?token=" + token
    emailSubject := "Verify your email address"
    emailBody := "Please verify your account by clicking the link: " + verificationLink

    if err := utils.SendEmail(accountReq.Email, emailSubject, emailBody); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error sending verification email",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Account created successfully! Please check your email to verify your account.",
    })
}

// Handler function to verify the user's email
func verifyEmailHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    tokenStr := c.Query("token")

    token, parseErr := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if parseErr != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        username := claims["username"].(string)
        if verifyErr := accountDB.VerifyUserEmail(username); verifyErr != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Error verifying email",
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "message": "Email verified successfully!",
        })
    }

    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
        "error": "Invalid or expired token",
    })
}

// Handler function for forgot password
func forgotPasswordHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ForgotPasswordRequest struct {
        Email string `json:"email"`
    }

    var req ForgotPasswordRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    user, err := accountDB.GetUserByEmail(req.Email)
    if err != nil || user == nil {
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "message": "If an account with that email exists, a reset link has been sent.",
        })
    }

	log.Printf("Fetched user: %+v", user) 

    token, err := generatePasswordResetToken(user.Username, accountDB)
	log.Print("here", user.Username)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating password reset token",
        })
    }

    resetLink := "http://localhost:5173/pages/profile/reset_password?token=" + token
    emailSubject := "Password Reset Request"
    emailBody := fmt.Sprintf(`Hello %s,

We received a request to reset your password. Click the link below to reset:

%s`, user.Username, resetLink)

    if err := utils.SendEmail(req.Email, emailSubject, emailBody); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error sending password reset email",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "If an account with that email exists, a reset link has been sent.",
    })
}

// Handler function for resetting password
func resetPasswordHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ResetPasswordRequest struct {
        Token       string `json:"token"`
        NewPassword string `json:"new_password"`
    }

    var req ResetPasswordRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    token, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if err != nil || !token.Valid {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || claims["type"] != "password_reset" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    username, ok := claims["username"].(string)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    valid, err := accountDB.IsPasswordResetTokenValid(req.Token, username)
    if err != nil || !valid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    if err := accountDB.UpdatePassword(username, req.NewPassword); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating password",
        })
    }

    if err := accountDB.MarkPasswordResetTokenAsUsed(req.Token); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error processing request",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Password has been reset successfully!",
    })
}

// Generate verification token for JWT
func generateVerificationToken(username string) (string, error) {
    claims := jwt.MapClaims{
        "username": username,
        "exp":      time.Now().Add(time.Hour * 24).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

// Generate password reset token
func generatePasswordResetToken(username string, accountDB *accountdatabase.AccountDatabase) (string, error) {
    claims := jwt.MapClaims{
        "username": username,
        "type":     "password_reset",
        "exp":      time.Now().Add(time.Hour * 1).Unix(),
    }

	log.Print("updating password for:", username)

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(secretKey)
    if err != nil {
        return "", fmt.Errorf("failed to sign token: %w", err)
    }

    _, err = accountDB.CreatePasswordResetToken(username, tokenString)
    if err != nil {
        return "", fmt.Errorf("failed to create password reset token in database: %w", err)
    }

    return tokenString, nil
}
