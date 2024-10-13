package main

import (
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/joho/godotenv" 
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/handlers"
    "shellhacks/api/utils"
)

var nftDB *nftdatabase.NFTDatabase
var accountDB *accountdatabase.AccountDatabase
var uploader *utils.Uploader

func main() {
    if err := godotenv.Load(); err != nil {
        log.Fatalf("Error loading .env file: %v\n", err)
    }

    nftDBURL := os.Getenv("NFT_DB_URL")
    accountDBURL := os.Getenv("ACCOUNT_DB_URL")
    azureBlobConnectionString := os.Getenv("AZURE_BLOB_CONNECTION_STRING")

    var err error
    nftDB, err = nftdatabase.NewNFTDatabase(nftDBURL)
    if err != nil {
        log.Fatalf("Unable to connect to NFT database: %v\n", err)
    }
    defer nftDB.Pool.Close()

    accountDB, err = accountdatabase.NewAccountDatabase(accountDBURL)
    if err != nil {
        log.Fatalf("Unable to connect to account database: %v\n", err)
    }
    defer accountDB.Pool.Close()

    uploader, err = utils.NewUploader(azureBlobConnectionString)
    if err != nil {
        log.Fatalf("Unable to initialize Azure Blob Uploader: %v\n", err)
    }

    app := fiber.New()
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*", 
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // Register all routes through routes.go
    handlers.RegisterRoutes(app, accountDB, nftDB, uploader)

    log.Fatal(app.Listen(":3000"))
}

