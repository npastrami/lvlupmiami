package handlers

import (
    "github.com/gofiber/fiber/v2"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/utils"
)


// Register all account and marketplace routes
func RegisterRoutes(app *fiber.App, accountDB *accountdatabase.AccountDatabase, nftDB *nftdatabase.NFTDatabase, uploader *utils.Uploader) {
    // Account-related routes (from account.go, credentials.go, etc.)
    RegisterAccountRoutes(app, accountDB, nftDB, uploader)
    // Marketplace-related routes (from marketplace.go)
    RegisterMarketplaceRoutes(app.Group("/api/marketplace"), nftDB, accountDB)
}

// Register marketplace routes
func RegisterMarketplaceRoutes(router fiber.Router, nftDB *nftdatabase.NFTDatabase, accountDB *accountdatabase.AccountDatabase) {
    router.Get("/listings", func(c *fiber.Ctx) error { return getListingsHandler(c, nftDB) })
    router.Post("/listings", func(c *fiber.Ctx) error { return createListingHandler(c, nftDB) })
    router.Post("/transaction", func(c *fiber.Ctx) error { return addTransactionHandler(c, accountDB) })
}


// Register all account-related routes
func RegisterAccountRoutes(app *fiber.App, accountDB *accountdatabase.AccountDatabase, nftDB *nftdatabase.NFTDatabase, uploader *utils.Uploader) {
    // Credentials routes (from credentials.go)
    app.Post("/api/login", func(c *fiber.Ctx) error { return loginHandler(c, accountDB) })
    app.Post("/api/signup", func(c *fiber.Ctx) error { return createAccountHandler(c, accountDB) })
    app.Post("/api/forgot_password", func(c *fiber.Ctx) error { return forgotPasswordHandler(c, accountDB) })
    app.Post("/api/reset_password", func(c *fiber.Ctx) error { return resetPasswordHandler(c, accountDB) })
    app.Get("/api/verify_email", func(c *fiber.Ctx) error { return verifyEmailHandler(c, accountDB) })

    // Account routes (from account.go)
    app.Get("/api/account/profile", func(c *fiber.Ctx) error { return getProfileHandler(c, accountDB) })
    app.Put("/api/account/update", func(c *fiber.Ctx) error { return updateAccountHandler(c, accountDB) })
    app.Put("/api/account/update_wallet", func(c *fiber.Ctx) error { return updateWalletHandler(c, accountDB) })
    app.Post("/api/account/creator_application", func(c *fiber.Ctx) error { return createCreatorApplicationHandler(c, accountDB) })

    // KYC routes (from kyc.go)
    app.Post("/api/account/kyc_verification", func(c *fiber.Ctx) error { return kycVerificationHandler(c, accountDB, uploader) })
    app.Get("/api/review_kyc", func(c *fiber.Ctx) error { return reviewKYCRequestsHandler(c, accountDB) })
    app.Post("/api/approve_kyc", func(c *fiber.Ctx) error { return approveKYCRequestHandler(c, accountDB) })
    app.Post("/api/decline_kyc", func(c *fiber.Ctx) error { return declineKYCRequestHandler(c, accountDB) })

    // Release routes (from release.go)
    app.Post("/api/release_request", func(c *fiber.Ctx) error { return releaseFormHandler(c, accountDB, uploader) })
    app.Get("/api/review_release_requests", func(c *fiber.Ctx) error { return reviewReleaseRequestsHandler(c, accountDB) })
    app.Post("/api/approve_release", func(c *fiber.Ctx) error { return approveReleaseHandler(c, accountDB, nftDB) })

	
}
