package main

import (
    "context"
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

var nftDB *NFTDatabase

func main() {
    dbURL := "postgres://username:password@localhost:5432/nftdatabase"

    // Initialize the NFT Database
    var err error
    nftDB, err = NewNFTDatabase(dbURL)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    defer nftDB.Pool.Close()

    // Initialize Fiber app
    app := fiber.New()
    app.Use(logger.New())

    // Register routes
    app.Get("/api/listings", getListingsHandler)

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

    // Return listings in JSON format
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

    // Check credentials in the database
    isValid, err := validateCredentials(nftDB.Pool, loginReq.Username, loginReq.Password)
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

    // Return success response
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Login successful",
    })
}

// Function to validate account credentials
func validateCredentials(pool *pgxpool.Pool, username, password string) (bool, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var storedPassword string
    query := `SELECT password FROM accountsettings WHERE username=$1`
    err := pool.QueryRow(ctx, query, username).Scan(&storedPassword)
    if err != nil {
        if err.Error() == "no rows in result set" {
            return false, nil // Username not found
        }
        return false, fmt.Errorf("failed to query accountsettings: %w", err)
    }

    // Check if the password matches (for simplicity, we're using plain text passwords here)
    if storedPassword == password {
        return true, nil
    }

    return false, nil
}