package main

import (
    "context"
    "fmt"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
)

func InitializeAccountDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Create the accountsettings table
    query := `
        CREATE TABLE IF NOT EXISTS accountsettings (
            account_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            eth_wallet_id TEXT,
            nft_addresses TEXT,
            marketplace_listing_ids TEXT
        );
    `
    _, err := pool.Exec(ctx, query)
    if err != nil {
        return fmt.Errorf("failed to create accountsettings table: %w", err)
    }

    return nil
}

// Function to insert a new account into the accountsettings table
func InsertAccount(pool *pgxpool.Pool, username, password, email, ethWalletID, nftAddresses, marketplaceListingIDs string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO accountsettings (username, password, email, eth_wallet_id, nft_addresses, marketplace_listing_ids)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    _, err := pool.Exec(ctx, query, username, password, email, ethWalletID, nftAddresses, marketplaceListingIDs)
    if err != nil {
        return fmt.Errorf("failed to insert account: %w", err)
    }

    return nil
}
