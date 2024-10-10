package nftdatabase

import (
    "context"
    "fmt"
    "time"
    "shellhacks/api/database/accountdatabase"
    "github.com/jackc/pgx/v4/pgxpool"
)

// NFTDatabase represents the database for managing NFT data
type NFTDatabase struct {
    Pool *pgxpool.Pool
}

// NewNFTDatabase initializes a new NFTDatabase instance
func NewNFTDatabase(dbURL string) (*NFTDatabase, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    pool, err := pgxpool.Connect(ctx, dbURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to NFT database: %w", err)
    }

    // Initialize tables in the NFT database
    if err := InitializeNFTDatabase(pool); err != nil {
        return nil, fmt.Errorf("failed to initialize NFT database tables: %w", err)
    }

    return &NFTDatabase{Pool: pool}, nil
}

// InitializeNFTDatabase initializes tables for NFTs
func InitializeNFTDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    createMarketplaceListingsTable := `
        CREATE TABLE IF NOT EXISTS marketplace_listings (
            listing_id SERIAL PRIMARY KEY,
            release_name TEXT NOT NULL,
            seller_address TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
    createFreshMintsTable := `
        CREATE TABLE IF NOT EXISTS fresh_mints (
            mint_id SERIAL PRIMARY KEY,
            release_name TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
    createQueuedMintsTable := `
        CREATE TABLE IF NOT EXISTS queued_mints (
            queue_id SERIAL PRIMARY KEY,
            release_name TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `

    // Execute the table creation queries
    queries := []string{
        createMarketplaceListingsTable,
        createFreshMintsTable,
        createQueuedMintsTable,
    }

    for _, query := range queries {
        if _, err := pool.Exec(ctx, query); err != nil {
            return fmt.Errorf("failed to execute query (%s): %w", query, err)
        }
    }

    return nil
}

// InsertListing inserts a new listing into the marketplace_listings table
func (db *NFTDatabase) InsertListing(nftID, sellerAddress string, price float64, imageURL string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO marketplace_listings (nft_id, seller_address, price, image_url)
        VALUES ($1, $2, $3, $4)
    `
    _, err := db.Pool.Exec(ctx, query, nftID, sellerAddress, price, imageURL)
    if err != nil {
        return fmt.Errorf("failed to insert listing: %w", err)
    }

    return nil
}

// GetAllListings fetches all marketplace listings from the database
func (db *NFTDatabase) GetAllListings() ([]map[string]interface{}, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    rows, err := db.Pool.Query(ctx, "SELECT * FROM marketplace_listings")
    if err != nil {
        return nil, fmt.Errorf("failed to fetch listings: %w", err)
    }
    defer rows.Close()

    listings := []map[string]interface{}{}

    for rows.Next() {
        var listingID int
        var nftID, sellerAddress, imageURL string
        var price float64
        var listedAt time.Time

        if err := rows.Scan(&listingID, &nftID, &sellerAddress, &price, &imageURL, &listedAt); err != nil {
            return nil, fmt.Errorf("failed to scan row: %w", err)
        }

        listings = append(listings, map[string]interface{}{
            "listing_id":     listingID,
            "release_name":   nftID,
            "seller_address": sellerAddress,
            "price":          price,
            "image_url":      imageURL,
            "listed_at":      listedAt,
        })
    }

    return listings, nil
}

func (db *NFTDatabase) QueueMint(request accountdatabase.ReleaseRequest) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO queued_mints (release_name, owner_address)
        VALUES ($1, $2)
    `
    // Assuming nft_id is generated from the release title
    releaseName := request.ReleaseTitle
    _, err := db.Pool.Exec(ctx, query, releaseName, request.Username)
    if err != nil {
        return fmt.Errorf("failed to queue mint: %w", err)
    }

    return nil
}
