package middlewares

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "shellhacks/api/utils"
    "strings"
)

func JWTMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        log.Println("Authorization Header:", authHeader)

        if !strings.HasPrefix(authHeader, "Bearer ") {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Authorization header missing or invalid"})
        }

        tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := utils.ParseToken(tokenStr)
        if err != nil {
            log.Println("Error parsing token:", err)
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
        }

        // Store the username in the context for use in future handlers
        c.Locals("username", claims.Username)

        return c.Next()
    }
}
