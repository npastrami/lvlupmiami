package utils

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/joho/godotenv"
	"mime/multipart" 
)

type Uploader struct {
	ConnectionString string
}

// NewUploader initializes a new Uploader.
func NewUploader(connectionString string) (*Uploader, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
		return nil, err
	}

	if connectionString == "" {
		return nil, fmt.Errorf("Connection string is not set")
	}

	return &Uploader{
		ConnectionString: connectionString,
	}, nil
}

// Upload uploads a file to a specific container in Azure Blob storage.
func (u *Uploader) Upload(ctx context.Context, containerName, clientID string, file multipart.File, fileName string) (string, error) {
    // Create BlobServiceClient
    serviceClient, err := azblob.NewClientFromConnectionString(u.ConnectionString, nil)
    if err != nil {
        return "", fmt.Errorf("failed to create service client: %w", err)
    }

    // Create the full blob name with the client ID
    blobName := fmt.Sprintf("%s/%s", clientID, fileName)

    // Upload the file using the file stream directly
    _, err = serviceClient.UploadStream(ctx, containerName, blobName, file, nil)
    if err != nil {
        return "", fmt.Errorf("failed to upload blob: %w", err)
    }

    // Return the blob URL
    blobURL := fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", os.Getenv("AZURE_ACCOUNT_NAME"), containerName, blobName)
    return blobURL, nil
}

