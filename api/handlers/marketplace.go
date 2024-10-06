package handlers

import (
    "github.com/gofiber/fiber/v2"
    "log"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/database/accountdatabase"
)

func RegisterMarketplaceRoutes(router fiber.Router, nftDB *nftdatabase.NFTDatabase, accountDB *accountdatabase.AccountDatabase) {
    // Passing the handler functions with nftDB and accountDB as arguments
    router.Get("/listings", func(c *fiber.Ctx) error {
        return getListingsHandler(c, nftDB)
    })
    router.Post("/transaction", func(c *fiber.Ctx) error {
        return addTransactionHandler(c, accountDB)
    })
}

// Handler function to fetch listings
func getListingsHandler(c *fiber.Ctx, nftDB *nftdatabase.NFTDatabase) error {
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

// Handler function to add a transaction
func addTransactionHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ServiceRequest struct {
        ClientID        string `json:"client_id"`
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
