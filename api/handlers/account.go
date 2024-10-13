package handlers

import (
    "github.com/gofiber/fiber/v2"
    "log"
    "shellhacks/api/database/accountdatabase"
    "shellhacks/api/utils"
    "time"
    "fmt"
    "shellhacks/api/database/nftdatabase"
    "golang.org/x/crypto/bcrypt"
    "github.com/dgrijalva/jwt-go"

)

var secretKey = []byte("mysecretkey") // Ensure you import and set your secretKey here

// RegisterAccountRoutes registers all account-related public routes
func RegisterAccountRoutes(app *fiber.App, accountDB *accountdatabase.AccountDatabase, nftDB *nftdatabase.NFTDatabase, uploader *utils.Uploader) {
    app.Get("/api/verify_email", func(c *fiber.Ctx) error {
        return verifyEmailHandler(c, accountDB)
    })
    app.Post("/api/account/creator_application", func(c *fiber.Ctx) error {
        return createCreatorApplicationHandler(c, accountDB)
    })
    app.Put("/api/account/update_wallet", func(c *fiber.Ctx) error {
        return updateWalletHandler(c, accountDB)
    })
    app.Put("/api/account/update", func(c *fiber.Ctx) error {
        return updateAccountHandler(c, accountDB)
    })
    app.Post("/api/login", func(c *fiber.Ctx) error {
        return loginHandler(c, accountDB)
    })
    app.Get("/api/account/profile", func(c *fiber.Ctx) error {
        return getProfileHandler(c, accountDB)
    })
    app.Post("/api/signup", func(c *fiber.Ctx) error {
        return createAccountHandler(c, accountDB)
    })
    app.Post("/api/release_request", func(c *fiber.Ctx) error {
        return releaseFormHandler(c, accountDB, uploader)
    })
    app.Get("/api/review_release_requests", func(c *fiber.Ctx) error {
        return reviewReleaseRequestsHandler(c, accountDB)
    })
    app.Post("/api/approve_release", func(c *fiber.Ctx) error {
        return approveReleaseHandler(c, accountDB, nftDB)
    })
    app.Post("/api/forgot_password", func(c *fiber.Ctx) error {
        return forgotPasswordHandler(c, accountDB)
    })
    app.Post("/api/reset_password", func(c *fiber.Ctx) error {
        return resetPasswordHandler(c, accountDB)
    })
    app.Get("/api/review_kyc", func(c *fiber.Ctx) error {
        return reviewKYCRequestsHandler(c, accountDB)
    })
    app.Post("/api/approve_kyc", func(c *fiber.Ctx) error {
        return approveKYCRequestHandler(c, accountDB)
    })
    app.Post("/api/decline_kyc", func(c *fiber.Ctx) error {
        return declineKYCRequestHandler(c, accountDB)
    })
    app.Post("/api/account/kyc_verification", func(c *fiber.Ctx) error {
        return kycVerificationHandler(c, accountDB, uploader)
    })
    
}

// Handler function for login
func loginHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type LoginRequest struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    var loginReq LoginRequest
    if err := c.BodyParser(&loginReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    // Retrieve user details, including whether the email is verified
    user, err := accountDB.GetUserByUsername(loginReq.Username)
    if err != nil {
        log.Printf("Error finding user: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error finding user",
        })
    }

    if user == nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    // Check if the password is correct
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid username or password",
        })
    }

    // Check if the email is verified
    if !user.EmailVerified {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Please verify your email before logging in.",
        })
    }

    // If everything is correct, return success message
    token, err := generateVerificationToken(user.Username)
    if err != nil {
        log.Printf("Error generating token: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating token",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Login successful",
        "token":   token,
    })
}

// Handler function to create an account
func createAccountHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type AccountRequest struct {
        Username string `json:"username"`
        Password string `json:"password"`
        Email    string `json:"email"`
    }

    var accountReq AccountRequest
    if err := c.BodyParser(&accountReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    err := accountDB.CreateUser(accountReq.Username, accountReq.Password, accountReq.Email)
    if err != nil {
        log.Printf("Error creating account: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error creating account",
        })
    }

    token, err := generateVerificationToken(accountReq.Username)
    if err != nil {
        log.Printf("Error generating verification token: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating verification token",
        })
    }

    verificationLink := "http://localhost:3000/api/verify_email?token=" + token
    log.Printf("Verification link: %s", verificationLink) // Simulate sending an email

    // Send the verification email to the user's email address
    emailSubject := "Verify your email address"
    emailBody := "Please verify your account by clicking the link: " + verificationLink
    if err := utils.SendEmail(accountReq.Email, emailSubject, emailBody); err != nil {
        log.Printf("Error sending verification email: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error sending verification email",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Account created successfully! Please check your email to verify your account.",
    })
}

// Generate verification token
func generateVerificationToken(username string) (string, error) {
    claims := jwt.MapClaims{}
    claims["username"] = username
    claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

// Handler function to verify the user's email
func verifyEmailHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    tokenStr := c.Query("token")

    token, parseErr := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if parseErr != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        username := claims["username"].(string)
        if verifyErr := accountDB.VerifyUserEmail(username); verifyErr != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Error verifying email",
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "message": "Email verified successfully!",
        })
    }

    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
        "error": "Invalid or expired token",
    })
}

// Handler function to update account details
func updateAccountHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type UpdateAccountRequest struct {
        Username    string `json:"username"`
        NewUsername string `json:"new_username"`
        NewEmail    string `json:"new_email"`
        NewPassword string `json:"new_password"`
    }

    var updateReq UpdateAccountRequest
    if err := c.BodyParser(&updateReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if updateErr := accountDB.UpdateAccount(updateReq.Username, updateReq.NewUsername, updateReq.NewEmail, updateReq.NewPassword); updateErr != nil {
        log.Printf("Error updating account: %v", updateErr)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating account",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Account updated successfully",
    })
}

// Handler function to fetch user profile
func getProfileHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

    // Parse the JWT token from the Authorization header
    tokenStr := authHeader[len("Bearer "):] // Assuming "Bearer " prefix
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
    user, err := accountDB.GetUserByUsername(username)
    if err != nil {
        log.Printf("Error finding user: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error finding user",
        })
    }

    if user == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "User not found",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "username":    user.Username,
        "email":       user.Email,
        "account_type": user.AccountType, // Include account_type in the response
    })
}

// Handler function to create a creator application
func createCreatorApplicationHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type CreatorApplicationRequest struct {
        Username      string `json:"username"`
        CreatorName   string `json:"creator_name"`
        Website       string `json:"website"`
        SocialMedia1  string `json:"social_media_1"`
        SocialMedia2  string `json:"social_media_2"`
        Reason        string `json:"reason"`
    }

    var appReq CreatorApplicationRequest
    if err := c.BodyParser(&appReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if err := accountDB.AddCreatorApplication(appReq.Username, appReq.CreatorName, appReq.Website, appReq.SocialMedia1, appReq.SocialMedia2, appReq.Reason); err != nil {
        log.Printf("Error adding creator application: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error adding creator application",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Creator application submitted successfully!",
    })
}

// Handler function to update the wallet ID
func updateWalletHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type UpdateWalletRequest struct {
        WalletID string `json:"wallet_id"`
    }

    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Missing authorization header",
        })
    }

    tokenStr := authHeader[len("Bearer "):] // Assuming "Bearer " prefix
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

    var walletReq UpdateWalletRequest
    if err := c.BodyParser(&walletReq); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    if walletReq.WalletID == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Wallet ID cannot be empty",
        })
    }

    if updateErr := accountDB.UpdateWalletID(username, walletReq.WalletID); updateErr != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update wallet ID",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Wallet ID updated successfully!",
    })
}

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

    // Upload media file to the "release-request" container
    containerName := "release-request"
    blobURL, err := uploader.Upload(c.Context(), containerName, username, mediaFileStream, mediaHeader.Filename)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to upload media to Azure Blob Storage",
        })
    }

    // Add the release request to the database
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
        log.Printf("Error retrieving release requests: %v", err)
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
        log.Printf("Error retrieving release request: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error retrieving release request",
        })
    }

    if releaseRequest == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "Release request not found",
        })
    }

    // Dereference releaseRequest pointer to pass it to QueueMint function
    err = nftDB.QueueMint(*releaseRequest)
    if err != nil {
        log.Printf("Error queuing mint: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error queuing mint",
        })
    }

    // Remove the approved release request from the release_requests table
    err = accountDB.DeleteReleaseRequest(approveReq.ReleaseID)
    if err != nil {
        log.Printf("Error deleting release request: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error deleting release request",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Release request approved successfully!",
    })
}

func generatePasswordResetToken(username string, accountDB *accountdatabase.AccountDatabase) (string, error) {
    // Create JWT claims
    claims := jwt.MapClaims{}
    claims["username"] = username
    claims["type"] = "password_reset"
    claims["exp"] = time.Now().UTC().Add(time.Hour * 1).Unix() // Token valid for 1 hour

    // Create the token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(secretKey)
    if err != nil {
        return "", fmt.Errorf("failed to sign token: %w", err)
    }

    // Insert the token into the database
    _, err = accountDB.CreatePasswordResetToken(username, tokenString)
    if err != nil {
        return "", fmt.Errorf("failed to create password reset token in database: %w", err)
    }

    return tokenString, nil
}

func forgotPasswordHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ForgotPasswordRequest struct {
        Email string `json:"email"`
    }

    var req ForgotPasswordRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    // Check if the email exists in the database
    user, err := accountDB.GetUserByEmail(req.Email)
    if err != nil || user == nil {
        // For security reasons, do not reveal if the email exists or not
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "message": "If an account with that email exists, a reset link has been sent.",
        })
    }

    // Generate a password reset token
    token, err := generatePasswordResetToken(user.Username, accountDB)
    if err != nil {
        log.Printf("Error generating password reset token: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error generating password reset token",
        })
    }

    resetLink := "http://localhost:5173/pages/profile/reset_password?token=" + token
    log.Printf("Password reset link: %s", resetLink) // For debugging

    // Send the password reset email
    emailSubject := "Password Reset Request"
    emailBody := fmt.Sprintf(`
Hello %s,

We received a request to reset your password. Please click the link below to set a new password:

%s

If you did not request a password reset, please ignore this email.

Thank you,
Your Company Name
`, user.Username, resetLink)

    if err := utils.SendEmail(req.Email, emailSubject, emailBody); err != nil {
        log.Printf("Error sending password reset email: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error sending password reset email",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "If an account with that email exists, a reset link has been sent.",
    })
}

// Handler function for resetting password
func resetPasswordHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    type ResetPasswordRequest struct {
        Token       string `json:"token"`
        NewPassword string `json:"new_password"`
    }

    var req ResetPasswordRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request format",
        })
    }

    // Parse and validate the token
    token, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.ErrUnauthorized
        }
        return secretKey, nil
    })

    if err != nil || !token.Valid {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || claims["type"] != "password_reset" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    username, ok := claims["username"].(string)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid token claims",
        })
    }

    // Verify the token in the database
    valid, err := accountDB.IsPasswordResetTokenValid(req.Token, username)
    if err != nil {
        log.Printf("Error verifying password reset token: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error verifying password reset token",
        })
    }

    if !valid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid or expired token",
        })
    }

    // Update the user's password
    if err := accountDB.UpdatePassword(username, req.NewPassword); err != nil {
        log.Printf("Error updating password: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error updating password",
        })
    }

    // Mark the token as used
    if err := accountDB.MarkPasswordResetTokenAsUsed(req.Token); err != nil {
        log.Printf("Error marking token as used: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error processing request",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Password has been reset successfully!",
    })
}

// Handler function to retrieve all KYC requests for review
func reviewKYCRequestsHandler(c *fiber.Ctx, accountDB *accountdatabase.AccountDatabase) error {
    // Fetch all KYC requests from the database
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

    // Decline the KYC request by deleting it from kyc_pending
    if err := accountDB.DeclineKYCRequest(declineReq.KycID); err != nil {
        log.Printf("Error declining KYC request: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Error declining KYC request",
        })
    }

    // Send email notification about declined KYC
    emailSubject := "KYC Verification Declined"
    emailBody := "We regret to inform you that your KYC verification has been declined. Please try submitting your documents again."
    if err := utils.SendEmail(declineReq.Email, emailSubject, emailBody); err != nil {
        log.Printf("Error sending email notification: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to send email notification",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "KYC request declined successfully!",
    })
}

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

    // Parse form data
    fullLegalName := c.FormValue("full_legal_name")
    address := c.FormValue("address")
    country := c.FormValue("country")
    email := c.FormValue("email")
    phoneNumber := c.FormValue("phone_number")
    dateOfBirth := c.FormValue("date_of_birth")

    // Get the document (government ID) and face image
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

    // Open file streams for both files
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

    // Upload both images to the "kyc-verification-requests" container
    containerName := "kyc-verification-requests"
    
    // Upload document
    log.Printf("Uploading file: %s to container: %s", documentFile.Filename, containerName)
    documentBlobURL, err := uploader.Upload(c.Context(), containerName, username, documentStream, documentFile.Filename)
    if err != nil {
        log.Printf("Error uploading document to Azure Blob Storage: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": fmt.Sprintf("Failed to upload document to Azure Blob Storage: %v", err),
        })
    }

    // Upload face image
    log.Printf("Uploading file: %s to container: %s", faceImageFile.Filename, containerName)
    faceImageBlobURL, err := uploader.Upload(c.Context(), containerName, username, faceImageStream, faceImageFile.Filename)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to upload face image to Azure Blob Storage",
        })
    }

    // Store the KYC request details in the database
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
