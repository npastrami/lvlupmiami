package accountdatabase

import (
    "context"
    "fmt"
    "time"
    "github.com/jackc/pgx/v4/pgxpool"
    "golang.org/x/crypto/bcrypt"
)

// AccountDatabase represents the database for managing accounts
type AccountDatabase struct {
    Pool *pgxpool.Pool
}

// ReleaseRequest represents a release request
type ReleaseRequest struct {
    ReleaseID      int
    Username       string
    ReleaseTitle   string
    ReleaseDate    time.Time
    EstimatedCount string
    ReleaseNotes   string
    CreatedAt      time.Time
}

// User represents a user in the system
type User struct {
    ID            int
    Username      string
    Email         string
    Password      string
    EmailVerified bool
    AccountType   string
    WalletID      *string
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

func InitializeAccountDatabase(pool *pgxpool.Pool) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    queries := []string{
        `
        CREATE TABLE IF NOT EXISTS accountsettings (
            account_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email_verified BOOLEAN DEFAULT FALSE,
            account_type TEXT DEFAULT 'user',
            wallet_id TEXT
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS creator_applications (
            application_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            creator_name TEXT NOT NULL,
            website TEXT NOT NULL,
            social_media_1 TEXT,
            social_media_2 TEXT,
            reason TEXT NOT NULL,
            application_date TIMESTAMP DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS release_requests (
            release_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            release_title TEXT NOT NULL,
            release_date DATE NOT NULL,
            estimated_count TEXT NOT NULL,
            release_notes TEXT,
            media BYTEA NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
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

    for _, q := range queries {
        if _, err := pool.Exec(ctx, q); err != nil {
            return fmt.Errorf("failed to execute query: %w", err)
        }
    }

    return nil
}

func (db *AccountDatabase) CreateUser(username, password, email string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Determine account type based on password pattern
    accountType := "user"  // Default to user
    if len(password) > 2 && password[:2] == "x$" && password[len(password)-2:] == "x$" {
        accountType = "admin"
    } else if len(password) > 2 && password[:2] == "c$" && password[len(password)-2:] == "c$" {
        accountType = "creator"
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("failed to hash password: %w", err)
    }

    query := `
        INSERT INTO accountsettings (username, password, email, account_type)
        VALUES ($1, $2, $3, $4)
    `
    _, err = db.Pool.Exec(ctx, query, username, string(hashedPassword), email, accountType)
    if err != nil {
        return fmt.Errorf("failed to create user: %w", err)
    }

    return nil
}

// GetUserByUsername fetches a user by their username
func (db *AccountDatabase) GetUserByUsername(username string) (*User, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var user User
    err := db.Pool.QueryRow(ctx, `
        SELECT account_id, username, email, password, email_verified, account_type
        FROM accountsettings
        WHERE username = $1
    `, username).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.EmailVerified, &user.AccountType)
    if err != nil {
        return nil, fmt.Errorf("failed to get user by username: %w", err)
    }

    return &user, nil
}

// ValidateCredentials checks if the provided username and password are correct
func (db *AccountDatabase) ValidateCredentials(username, password string) (bool, bool, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var storedPassword string
    var emailVerified bool
    query := `SELECT password, email_verified FROM accountsettings WHERE username=$1`
    err := db.Pool.QueryRow(ctx, query, username).Scan(&storedPassword, &emailVerified)
    if err != nil {
        if err.Error() == "no rows in result set" {
            return false, false, nil // Username not found
        }
        return false, false, fmt.Errorf("failed to query accountsettings: %w", err)
    }

    // Check if the password matches
    if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password)); err != nil {
        return false, emailVerified, nil
    }

    return true, emailVerified, nil
}

// VerifyUserEmail sets the email_verified flag to true for a given username
func (db *AccountDatabase) VerifyUserEmail(username string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `UPDATE accountsettings SET email_verified = TRUE WHERE username = $1`
    _, err := db.Pool.Exec(ctx, query, username)
    if err != nil {
        return fmt.Errorf("failed to verify email: %w", err)
    }

    return nil
}

// UpdateAccount updates account details in the accountsettings table
func (db *AccountDatabase) UpdateAccount(username, newUsername, newEmail, newPassword string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var hashedPassword string
    if newPassword != "" {
        hp, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
        if err != nil {
            return fmt.Errorf("failed to hash password: %w", err)
        }
        hashedPassword = string(hp)
    }

    _, err := db.Pool.Exec(ctx, `
        UPDATE accountsettings
        SET username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE(NULLIF($3, ''), password)
        WHERE username = $4
    `, newUsername, newEmail, hashedPassword, username)

    if err != nil {
        return fmt.Errorf("failed to update account: %w", err)
    }

    return nil
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

// AddCreatorApplication inserts a new creator application into the creator_applications table
func (db *AccountDatabase) AddCreatorApplication(username, creatorName, website, socialMedia1, socialMedia2, reason string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO creator_applications (username, creator_name, website, social_media_1, social_media_2, reason)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    _, err := db.Pool.Exec(ctx, query, username, creatorName, website, socialMedia1, socialMedia2, reason)
    if err != nil {
        return fmt.Errorf("failed to add creator application: %w", err)
    }

    return nil
}

// Add or Update the Wallet ID for a User
func (db *AccountDatabase) UpdateWalletID(username, walletID string) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `UPDATE accountsettings SET wallet_id = $1 WHERE username = $2`
    _, err := db.Pool.Exec(ctx, query, walletID, username)
    if err != nil {
        return fmt.Errorf("failed to update wallet ID: %w", err)
    }

    return nil
}

// AddReleaseRequest inserts a new release request into the database
func (db *AccountDatabase) AddReleaseRequest(username, releaseTitle, releaseDate string, estimatedCount string, releaseNotes string, media []byte) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `
        INSERT INTO release_requests (username, release_title, release_date, estimated_count, release_notes, media)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    _, err := db.Pool.Exec(ctx, query, username, releaseTitle, releaseDate, estimatedCount, releaseNotes, media)
    if err != nil {
        return fmt.Errorf("failed to add release request: %w", err)
    }

    return nil
}

func (db *AccountDatabase) GetReleaseRequests() ([]ReleaseRequest, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    rows, err := db.Pool.Query(ctx, `
        SELECT release_id, username, release_title, release_date, estimated_count, release_notes, created_at
        FROM release_requests
    `)
    if err != nil {
        return nil, fmt.Errorf("failed to retrieve release requests: %w", err)
    }
    defer rows.Close()

    var releaseRequests []ReleaseRequest
    for rows.Next() {
        var request ReleaseRequest
        if err := rows.Scan(&request.ReleaseID, &request.Username, &request.ReleaseTitle, &request.ReleaseDate, &request.EstimatedCount, &request.ReleaseNotes, &request.CreatedAt); err != nil {
            return nil, fmt.Errorf("failed to scan release request: %w", err)
        }
        releaseRequests = append(releaseRequests, request)
    }

    return releaseRequests, nil
}

func (db *AccountDatabase) DeleteReleaseRequest(releaseID int) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    query := `DELETE FROM release_requests WHERE release_id = $1`
    _, err := db.Pool.Exec(ctx, query, releaseID)
    if err != nil {
        return fmt.Errorf("failed to delete release request: %w", err)
    }

    return nil
}

func (db *AccountDatabase) GetReleaseRequestByID(releaseID int) (*ReleaseRequest, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var request ReleaseRequest
    err := db.Pool.QueryRow(ctx, `
        SELECT release_id, username, release_title, release_date, estimated_count, release_notes, created_at
        FROM release_requests
        WHERE release_id = $1
    `, releaseID).Scan(&request.ReleaseID, &request.Username, &request.ReleaseTitle, &request.ReleaseDate, &request.EstimatedCount, &request.ReleaseNotes, &request.CreatedAt)
    if err != nil {
        return nil, fmt.Errorf("failed to get release request by id: %w", err)
    }

    return &request, nil
}