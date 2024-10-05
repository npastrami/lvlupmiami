package main

import (
    "context"
    "fmt"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
)

func InitializeNFTDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    createMarketplaceListingsTable := `
        CREATE TABLE IF NOT EXISTS marketplace_listings (
            listing_id SERIAL PRIMARY KEY,
            nft_id TEXT NOT NULL,
            seller_address TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
    createTransactionsHistoryTable := `
        CREATE TABLE IF NOT EXISTS transactions_history (
            transaction_id SERIAL PRIMARY KEY,
            nft_id TEXT NOT NULL,
            buyer_address TEXT NOT NULL,
            seller_address TEXT NOT NULL,
            price REAL NOT NULL,
            transaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
    createFreshMintsTable := `
        CREATE TABLE IF NOT EXISTS fresh_mints (
            mint_id SERIAL PRIMARY KEY,
            nft_id TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
    createQueuedMintsTable := `
        CREATE TABLE IF NOT EXISTS queued_mints (
            queue_id SERIAL PRIMARY KEY,
            nft_id TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `

    // Execute the table creation queries
    _, err := pool.Exec(ctx, createMarketplaceListingsTable)
    if err != nil {
        return fmt.Errorf("failed to create marketplace_listings table: %w", err)
    }

    _, err = pool.Exec(ctx, createTransactionsHistoryTable)
    if err != nil {
        return fmt.Errorf("failed to create transactions_history table: %w", err)
    }

    _, err = pool.Exec(ctx, createFreshMintsTable)
    if err != nil {
        return fmt.Errorf("failed to create fresh_mints table: %w", err)
    }

    _, err = pool.Exec(ctx, createQueuedMintsTable)
    if err != nil {
        return fmt.Errorf("failed to create queued_mints table: %w", err)
    }

    return nil
}

// Function to insert a listing into marketplace_listings
func InsertListing(pool *pgxpool.Pool, nftID, sellerAddress string, price float64, imageURL string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO marketplace_listings (nft_id, seller_address, price, image_url)
        VALUES ($1, $2, $3, $4)
    `
    _, err := pool.Exec(ctx, query, nftID, sellerAddress, price, imageURL)
    if err != nil {
        return fmt.Errorf("failed to insert listing: %w", err)
    }

    return nil
}

// GetAllListings fetches all marketplace listings from the database
func (db *NFTDatabase) GetAllListings() ([]map[string]interface{}, error) {
    rows, err := db.Pool.Query(context.Background(), "SELECT * FROM marketplace_listings")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    listings := []map[string]interface{}{}

    for rows.Next() {
        var listingID int
        var nftID, sellerAddress, imageURL string
        var price float64
        var listedAt string

        if err := rows.Scan(&listingID, &nftID, &sellerAddress, &price, &imageURL, &listedAt); err != nil {
            return nil, err
        }

        listings = append(listings, map[string]interface{}{
            "listing_id":     listingID,
            "nft_id":         nftID,
            "seller_address": sellerAddress,
            "price":          price,
            "image_url":      imageURL,
            "listed_at":      listedAt,
        })
    }

    return listings, nil
}
