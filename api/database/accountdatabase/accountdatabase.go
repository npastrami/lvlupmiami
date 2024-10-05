package accountdatabase

import (
    "context"
    "fmt"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
)

// AccountDatabase represents the database for managing accounts
type AccountDatabase struct {
    Pool *pgxpool.Pool
}

// NewAccountDatabase initializes a new AccountDatabase instance
func NewAccountDatabase(dbURL string) (*AccountDatabase, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    pool, err := pgxpool.Connect(ctx, dbURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to account database: %w", err)
    }

    // Initialize tables in the account database
    if err := InitializeAccountDatabase(pool); err != nil {
        return nil, fmt.Errorf("failed to initialize account database tables: %w", err)
    }

    return &AccountDatabase{Pool: pool}, nil
}

// InitializeAccountDatabase initializes the account-related tables
func InitializeAccountDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    queries := []string{
        `
        CREATE TABLE IF NOT EXISTS accountsettings (
            account_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            eth_wallet_id TEXT,
            nft_addresses TEXT,
            marketplace_listing_ids TEXT
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS transaction_history (
            transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            items_sent JSONB,
            items_received JSONB,
            notes TEXT,
            status TEXT DEFAULT 'Pending...'
        );
        `,
    }

    // Execute the table creation queries
    for _, q := range queries {
        if _, err := pool.Exec(ctx, q); err != nil {
            return fmt.Errorf("failed to execute query: %w", err)
        }
    }

    return nil
}

// InsertAccount inserts a new account into the accountsettings table
func (db *AccountDatabase) InsertAccount(username, password, email, ethWalletID, nftAddresses, marketplaceListingIDs string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO accountsettings (username, password, email, eth_wallet_id, nft_addresses, marketplace_listing_ids)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    _, err := db.Pool.Exec(ctx, query, username, password, email, ethWalletID, nftAddresses, marketplaceListingIDs)
    if err != nil {
        return fmt.Errorf("failed to insert account: %w", err)
    }

    return nil
}

// ValidateCredentials checks if the provided username and password are correct
func (db *AccountDatabase) ValidateCredentials(username, password string) (bool, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var storedPassword string
    query := `SELECT password FROM accountsettings WHERE username=$1`
    err := db.Pool.QueryRow(ctx, query, username).Scan(&storedPassword)
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
func (db *AccountDatabase) AddTransaction(clientID, transactionType, itemsSent, itemsReceived, notes string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO transaction_history (client_id, transaction_type, items_sent, items_received, notes, status)
        VALUES ($1, $2, $3, $4, $5, 'Pending...')
    `
    _, err := db.Pool.Exec(ctx, query, clientID, transactionType, itemsSent, itemsReceived, notes)
    if err != nil {
        return fmt.Errorf("failed to add transaction: %w", err)
    }

    return nil
}

// UpdateAccount updates account details in the accountsettings table
func (db *AccountDatabase) UpdateAccount(username, newUsername, newEmail string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Define and execute the update query
    _, err := db.Pool.Exec(ctx, `
        UPDATE accountsettings
        SET username = $1, email = $2
        WHERE username = $3
    `, newUsername, newEmail, username)
    
    if err != nil {
        return fmt.Errorf("failed to update account: %w", err)
    }

    return nil
}
