package main

import (
    "context"
    "fmt"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
)

// InitializeAccountDatabase initializes the accountsettings table
func InitializeAccountDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        CREATE TABLE IF NOT EXISTS accountsettings (
            account_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
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

    // Create the service_projects table
    query = `
        CREATE TABLE IF NOT EXISTS transaction_history (
            transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            items_sent JSONB,
            items_received JSONB,
            notes TEXT,
            status TEXT DEFAULT 'Pending...',
        );
    `
    _, err = pool.Exec(ctx, query)
    if err != nil {
        return fmt.Errorf("failed to create service_projects table: %w", err)
    }

    return nil
}

// InsertAccount inserts a new account into the accountsettings table
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

// ValidateCredentials checks if the provided username and password are correct
func ValidateCredentials(pool *pgxpool.Pool, username, password string) (bool, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var storedPassword string
    query := `SELECT password FROM accountsettings WHERE username=$1`
    err := pool.QueryRow(ctx, query, username).Scan(&storedPassword)
    if err != nil {
        if err.Error() == "no rows in result set" {
            return false, nil // Username not found
        }
        return false, fmt.Errorf("failed to query accountsettings: %w", err)
    }

    // Check if the password matches (for simplicity, we're using plain text passwords here)
    if storedPassword == password {
        return true, nil
    }

    return false, nil
}

// AddTransaction adds a new transaction to the transaction_history table
func AddTransaction(pool *pgxpool.Pool, clientID, serviceType, documents, notes string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO transaction_history (client_id, service_type, documents_required, notes, status)
        VALUES ($1, $2, $3, $4, 'Backlog')
    `
    _, err := pool.Exec(ctx, query, clientID, serviceType, documents, notes)
    if err != nil {
        return fmt.Errorf("failed to add service: %w", err)
    }

    return nil
}

// UpdateAccount updates account details in the accountsettings table
func UpdateAccount(pool *pgxpool.Pool, username, newUsername, newEmail string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        UPDATE accountsettings
        SET username = $1, email = $2
        WHERE username = $3
    `
    _, err := pool.Exec(ctx, query, newUsername, newEmail, username)
    if err != nil {
        return fmt.Errorf("failed to update account: %w", err)
    }

    return nil
}