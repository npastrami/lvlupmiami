package handlers

import (
    "github.com/gofiber/fiber/v2"
    "log"
    "shellhacks/api/database/accountdatabase"
    "github.com/dgrijalva/jwt-go"
)

// Handler function to fetch user profile
func getProfileHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

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
    if err != nil || user == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "User not found",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "username":     user.Username,
        "email":        user.Email,
        "account_type": user.AccountType,
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

    if err := accountDB.UpdateAccount(updateReq.Username, updateReq.NewUsername, updateReq.NewEmail, updateReq.NewPassword); err != nil {
        log.Printf("Error updating account: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating account",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Account updated successfully",
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

    if err := accountDB.UpdateWalletID(username, walletReq.WalletID); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update wallet ID",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Wallet ID updated successfully!",
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
