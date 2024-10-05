// main.go
package main

import (
    "context"
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/jackc/pgx/v4/pgxpool"
    "time"
)

var nftDB *NFTDatabase
var accountDB *pgxpool.Pool

func main() {
    // Database connection URL
    dbURL := "postgres://username:password@localhost:5432/nftdatabase"

    // Initialize the NFT Database
    var err error
    nftDB, err = NewNFTDatabase(dbURL)
    if err != nil {
        log.Fatalf("Unable to connect to NFT database: %v\n", err)
    }
    defer nftDB.Pool.Close()

    // Initialize Account Database
    accountDB, err = pgxpool.Connect(context.Background(), dbURL)
    if err != nil {
        log.Fatalf("Unable to connect to account database: %v\n", err)
    }
    defer accountDB.Close()

    // Initialize Account Database Tables
    if err := InitializeAccountDatabase(accountDB); err != nil {
        log.Fatalf("Unable to initialize account database: %v\n", err)
    }

    // Initialize Fiber app
    app := fiber.New()
    app.Use(logger.New())

    // Register routes
    app.Get("/api/listings", getListingsHandler)
    app.Post("/api/login", loginHandler)
    app.Post("/api/account", createAccountHandler)
    app.Post("/api/service", addServiceHandler)

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

    isValid, err := ValidateCredentials(accountDB, loginReq.Username, loginReq.Password)
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

    err := InsertAccount(accountDB, accountReq.Username, accountReq.Password, accountReq.Email, "", "", "")
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
        Username     string `json:"username"`
        ServiceType  string `json:"service_type"`
        Documents    string `json:"documents"`
        Notes        string `json:"notes"`
    }

    var serviceReq ServiceRequest
    if err := c.BodyParser(&serviceReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    serviceID, err := AddTransaction(accountDB, serviceReq.Username, serviceReq.ServiceType, serviceReq.Documents, serviceReq.Notes)
    if err != nil {
        log.Printf("Error adding service: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding service",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message":   "Service added successfully",
        "service_id": serviceID,
    })
}