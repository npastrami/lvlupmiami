package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "golang.org/x/crypto/bcrypt"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/utils"
    "github.com/dgrijalva/jwt-go"
    "time"
)

var nftDB *nftdatabase.NFTDatabase
var accountDB *accountdatabase.AccountDatabase
var secretKey = []byte("mysecretkey")

func main() {
    // Separate Database connection URLs for NFT and Account databases
    nftDBURL := "postgres://postgres:newpassword@localhost:5432/nftdatabase"
    accountDBURL := "postgres://postgres:newpassword@localhost:5432/accountdatabase"

    // Initialize the NFT Database
    var err error
    nftDB, err = nftdatabase.NewNFTDatabase(nftDBURL)
    if err != nil {
        log.Fatalf("Unable to connect to NFT database: %v\n", err)
    }
    defer nftDB.Pool.Close()

    // Initialize Account Database
    accountDB, err = accountdatabase.NewAccountDatabase(accountDBURL)
    if err != nil {
        log.Fatalf("Unable to connect to account database: %v\n", err)
    }
    defer accountDB.Pool.Close()

    // Initialize Fiber app
    app := fiber.New()
    app.Use(logger.New())

    // Use CORS middleware to allow cross-origin requests
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*", // Change this to your front-end origin, e.g. "http://127.0.0.1:5173"
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // Register routes
    app.Get("/api/listings", getListingsHandler)
    app.Post("/api/login", loginHandler)
    app.Get("/api/profile", getProfileHandler)
    app.Post("/api/signup", createAccountHandler)
    app.Post("/api/transaction", addTransactionHandler)
    app.Put("/api/account/update", updateAccountHandler)
    app.Get("/api/verify-email", verifyEmailHandler)

    // Start server
    log.Fatal(app.Listen(":3000"))
}

// Handler function to fetch listings
func getListingsHandler(c *fiber.Ctx) error {
    listings, err := nftDB.GetAllListings()
    if err != nil {
        log.Printf("Error fetching marketplace listings: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Error fetching marketplace listings",
            "details": err.Error(),
        })
    }
    return c.Status(fiber.StatusOK).JSON(listings)
}

// Handler function for login
func loginHandler(c *fiber.Ctx) error {
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
func createAccountHandler(c *fiber.Ctx) error {
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
func verifyEmailHandler(c *fiber.Ctx) error {
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

// Handler function to add a transaction
func addTransactionHandler(c *fiber.Ctx) error {
    type ServiceRequest struct {
        ClientID       string `json:"client_id"`
        TransactionType string `json:"transaction_type"`
        ItemsSent       string `json:"items_sent"`
        ItemsReceived   string `json:"items_received"`
        Notes           string `json:"notes"`
    }

    var serviceReq ServiceRequest
    if err := c.BodyParser(&serviceReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if addErr := accountDB.AddTransaction(serviceReq.ClientID, serviceReq.TransactionType, serviceReq.ItemsSent, serviceReq.ItemsReceived, serviceReq.Notes); addErr != nil {
        log.Printf("Error adding transaction: %v", addErr)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding transaction",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Transaction added successfully",
    })
}

// Handler function to update account details
func updateAccountHandler(c *fiber.Ctx) error {
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
func getProfileHandler(c *fiber.Ctx) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

    // Parse the JWT token from the Authorization header
    tokenStr := authHeader[len("Bearer "):]
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
        "username": user.Username,
        "email":    user.Email,
    })
}