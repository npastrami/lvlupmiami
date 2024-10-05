// main.go
package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/cors"  // Import the CORS middleware
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/database/accountdatabase"
)

var nftDB *nftdatabase.NFTDatabase
var accountDB *accountdatabase.AccountDatabase

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
    app.Post("/api/signup", createAccountHandler)
    app.Post("/api/transaction", addTransactionHandler)
    app.Put("/api/account/update", updateAccountHandler)

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

    isValid, err := accountDB.ValidateCredentials(loginReq.Username, loginReq.Password)
    if err != nil {
        log.Printf("Error validating credentials: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error validating credentials",
        })
    }

    if !isValid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Login successful",
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

    err := accountDB.InsertAccount(accountReq.Username, accountReq.Password, accountReq.Email, "", "", "")
    if err != nil {
        log.Printf("Error creating account: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error creating account",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Account created successfully",
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

    err := accountDB.AddTransaction(serviceReq.ClientID, serviceReq.TransactionType, serviceReq.ItemsSent, serviceReq.ItemsReceived, serviceReq.Notes)
    if err != nil {
        log.Printf("Error adding transaction: %v", err)
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
    }

    var updateReq UpdateAccountRequest
    if err := c.BodyParser(&updateReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    err := accountDB.UpdateAccount(updateReq.Username, updateReq.NewUsername, updateReq.NewEmail)
    if err != nil {
        log.Printf("Error updating account: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating account",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Account updated successfully",
    })
}
