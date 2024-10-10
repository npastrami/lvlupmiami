package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/handlers"
)

var nftDB *nftdatabase.NFTDatabase
var accountDB *accountdatabase.AccountDatabase

func main() {
    // Separate Database connection URLs for NFT and Account databases
    nftDBURL := "postgres://postgres:0464111@localhost:5432/nftdatabase"
    accountDBURL := "postgres://postgres:0464111@localhost:5432/accountdatabase"

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

    //deeznutz

    // Use CORS middleware to allow cross-origin requests
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*", // Change this to your front-end origin, e.g. "http://127.0.0.1:5173"
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // Register routes
    handlers.RegisterAccountRoutes(app, accountDB, nftDB)
    handlers.RegisterMarketplaceRoutes(app.Group("/api/marketplace"), nftDB, accountDB)

    // Start server
    log.Fatal(app.Listen(":3000"))
}
