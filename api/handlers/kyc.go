package handlers

import (
    "github.com/gofiber/fiber/v2"
    "log"
	"fmt"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/utils"
    "github.com/dgrijalva/jwt-go"
)

// Handler function to retrieve all KYC requests for review
func reviewKYCRequestsHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    kycRequests, err := accountDB.GetAllPendingKYCRequests()
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch KYC requests",
        })
    }

    return c.Status(fiber.StatusOK).JSON(kycRequests)
}

// Handler function for approving KYC requests
func approveKYCRequestHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ApproveRequest struct {
        KycID int `json:"kyc_id"`
    }

    var approveReq ApproveRequest
    if err := c.BodyParser(&approveReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if err := accountDB.ApproveKYCRequest(approveReq.KycID); err != nil {
        log.Printf("Error approving KYC request: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error approving KYC request",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "KYC request approved successfully!",
    })
}

// Handler function for declining KYC requests
func declineKYCRequestHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type DeclineRequest struct {
        KycID int    `json:"kyc_id"`
        Email string `json:"email"`
    }

    var declineReq DeclineRequest
    if err := c.BodyParser(&declineReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if err := accountDB.DeclineKYCRequest(declineReq.KycID); err != nil {
        log.Printf("Error declining KYC request: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error declining KYC request",
        })
    }

    emailSubject := "KYC Verification Declined"
    emailBody := "We regret to inform you that your KYC verification has been declined. Please try submitting your documents again."
    if err := utils.SendEmail(declineReq.Email, emailSubject, emailBody); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to send email notification",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "KYC request declined successfully!",
    })
}

// Handler function for KYC verification
func kycVerificationHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase, uploader *utils.Uploader) error {
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

    fullLegalName := c.FormValue("full_legal_name")
    address := c.FormValue("address")
    country := c.FormValue("country")
    email := c.FormValue("email")
    phoneNumber := c.FormValue("phone_number")
    dateOfBirth := c.FormValue("date_of_birth")

    documentFile, err := c.FormFile("document")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Document file is required",
        })
    }

    faceImageFile, err := c.FormFile("face_image")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Face image file is required",
        })
    }

    documentStream, err := documentFile.Open()
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to read document file",
        })
    }
    defer documentStream.Close()

    faceImageStream, err := faceImageFile.Open()
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to read face image file",
        })
    }
    defer faceImageStream.Close()

    containerName := "kyc-verification-requests"
    documentBlobURL, err := uploader.Upload(c.Context(), containerName, username, documentStream, documentFile.Filename)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": fmt.Sprintf("Failed to upload document: %v", err),
        })
    }

    faceImageBlobURL, err := uploader.Upload(c.Context(), containerName, username, faceImageStream, faceImageFile.Filename)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to upload face image",
        })
    }

    err = accountDB.AddKYCRequest(username, fullLegalName, address, country, email, phoneNumber, dateOfBirth, []byte(documentBlobURL), []byte(faceImageBlobURL))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding KYC request",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "KYC verification request submitted successfully!",
    })
}
