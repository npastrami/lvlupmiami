package handlers

import (
    "github.com/gofiber/fiber/v2"
    "log"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/utils"
    "time"
    "golang.org/x/crypto/bcrypt"
    "github.com/dgrijalva/jwt-go"
)

var secretKey = []byte("mysecretkey") // Ensure you import and set your secretKey here

// RegisterAccountRoutes registers all account-related public routes
func RegisterAccountRoutes(app *fiber.App, accountDB *accountdatabase.AccountDatabase) {
    app.Get("/api/verify-email", func(c *fiber.Ctx) error {
        return verifyEmailHandler(c, accountDB)
    })
    app.Post("/api/account/creator-application", func(c *fiber.Ctx) error {
        return createCreatorApplicationHandler(c, accountDB)
    })
    app.Put("/api/account/update-wallet", func(c *fiber.Ctx) error {
        return updateWalletHandler(c, accountDB)
    })
    app.Put("/api/account/update", func(c *fiber.Ctx) error {
        return updateAccountHandler(c, accountDB)
    })
    app.Post("/api/login", func(c *fiber.Ctx) error {
        return loginHandler(c, accountDB)
    })
    app.Get("/api/account/profile", func(c *fiber.Ctx) error {
        return getProfileHandler(c, accountDB)
    })
    app.Post("/api/signup", func(c *fiber.Ctx) error {
        return createAccountHandler(c, accountDB)
    })
}

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

    // Retrieve user details, including whether the email is verified
    user, err := accountDB.GetUserByUsername(loginReq.Username)
    if err != nil {
        log.Printf("Error finding user: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error finding user",
        })
    }

    if user == nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    // Check if the password is correct
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    // Check if the email is verified
    if !user.EmailVerified {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Please verify your email before logging in.",
        })
    }

    // If everything is correct, return success message
    token, err := generateVerificationToken(user.Username)
    if err != nil {
        log.Printf("Error generating token: %v", err)
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
        log.Printf("Error creating account: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error creating account",
        })
    }

    token, err := generateVerificationToken(accountReq.Username)
    if err != nil {
        log.Printf("Error generating verification token: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating verification token",
        })
    }

    verificationLink := "http://localhost:3000/api/verify-email?token=" + token
    log.Printf("Verification link: %s", verificationLink) // Simulate sending an email

    // Send the verification email to the user's email address
    emailSubject := "Verify your email address"
    emailBody := "Please verify your account by clicking the link: " + verificationLink
    if err := utils.SendEmail(accountReq.Email, emailSubject, emailBody); err != nil {
        log.Printf("Error sending verification email: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error sending verification email",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Account created successfully! Please check your email to verify your account.",
    })
}

// Generate verification token
func generateVerificationToken(username string) (string, error) {
    claims := jwt.MapClaims{}
    claims["username"] = username
    claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
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

// Handler function to update account details
func updateAccountHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type UpdateAccountRequest struct {
        Username    string `json:"username"`
        NewUsername string `json:"new_username"`
        NewEmail    string `json:"new_email"`
        NewPassword string `json:"new_password"`
    }

    var updateReq UpdateAccountRequest
    if err := c.BodyParser(&updateReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if updateErr := accountDB.UpdateAccount(updateReq.Username, updateReq.NewUsername, updateReq.NewEmail, updateReq.NewPassword); updateErr != nil {
        log.Printf("Error updating account: %v", updateErr)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating account",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Account updated successfully",
    })
}

// Handler function to fetch user profile
func getProfileHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

    // Parse the JWT token from the Authorization header
    tokenStr := authHeader[len("Bearer "):] // Assuming "Bearer " prefix
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if err != nil || !token.Valid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token",
        })
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    username := claims["username"].(string)
    user, err := accountDB.GetUserByUsername(username)
    if err != nil {
        log.Printf("Error finding user: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error finding user",
        })
    }

    if user == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "User not found",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "username":    user.Username,
        "email":       user.Email,
        "account_type": user.AccountType, // Include account_type in the response
    })
}

// Handler function to create a creator application
func createCreatorApplicationHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type CreatorApplicationRequest struct {
        Username      string `json:"username"`
        CreatorName   string `json:"creator_name"`
        Website       string `json:"website"`
        SocialMedia1  string `json:"social_media_1"`
        SocialMedia2  string `json:"social_media_2"`
        Reason        string `json:"reason"`
    }

    var appReq CreatorApplicationRequest
    if err := c.BodyParser(&appReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if err := accountDB.AddCreatorApplication(appReq.Username, appReq.CreatorName, appReq.Website, appReq.SocialMedia1, appReq.SocialMedia2, appReq.Reason); err != nil {
        log.Printf("Error adding creator application: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding creator application",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Creator application submitted successfully!",
    })
}

// Handler function to update the wallet ID
func updateWalletHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type UpdateWalletRequest struct {
        WalletID string `json:"wallet_id"`
    }

    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

    tokenStr := authHeader[len("Bearer "):] // Assuming "Bearer " prefix
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if err != nil || !token.Valid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token",
        })
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    username := claims["username"].(string)

    var walletReq UpdateWalletRequest
    if err := c.BodyParser(&walletReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if walletReq.WalletID == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Wallet ID cannot be empty",
        })
    }

    if updateErr := accountDB.UpdateWalletID(username, walletReq.WalletID); updateErr != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update wallet ID",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Wallet ID updated successfully!",
    })
}