package handlers

import (
    "github.com/gofiber/fiber/v2"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/database/nftdatabase"
    "shellhacks/api/utils"
)

// Handler function for processing the release form submission
func releaseFormHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase, uploader *utils.Uploader) error {
    username := c.Query("username")
    releaseTitle := c.Query("release_title")
    releaseDate := c.Query("release_date")
    estimatedCount := c.Query("estimated_count")
    releaseNotes := c.Query("release_notes")

    if username == "" || releaseTitle == "" || releaseDate == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Required fields are missing",
        })
    }

    mediaHeader, err := c.FormFile("media")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Media file is required",
        })
    }

    mediaFileStream, err := mediaHeader.Open()
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to read media file",
        })
    }
    defer mediaFileStream.Close()

    containerName := "release-request"
    blobURL, err := uploader.Upload(c.Context(), containerName, username, mediaFileStream, mediaHeader.Filename)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to upload media to Azure Blob Storage",
        })
    }

    err = accountDB.AddReleaseRequest(username, releaseTitle, releaseDate, estimatedCount, releaseNotes, []byte(blobURL))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding release request",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Release request submitted successfully!",
    })
}

// Handler function for reviewing release requests
func reviewReleaseRequestsHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    releaseRequests, err := accountDB.GetReleaseRequests()
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error retrieving release requests",
        })
    }

    return c.Status(fiber.StatusOK).JSON(releaseRequests)
}

// Handler function for approving release requests
func approveReleaseHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase, nftDB *nftdatabase.NFTDatabase) error {
    type ApproveRequest struct {
        ReleaseID int `json:"release_id"`
    }

    var approveReq ApproveRequest
    if err := c.BodyParser(&approveReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    releaseRequest, err := accountDB.GetReleaseRequestByID(approveReq.ReleaseID)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error retrieving release request",
        })
    }

    if releaseRequest == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "Release request not found",
        })
    }

    err = nftDB.QueueMint(*releaseRequest)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error queuing mint",
        })
    }

    err = accountDB.DeleteReleaseRequest(approveReq.ReleaseID)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error deleting release request",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Release request approved successfully!",
    })
}
