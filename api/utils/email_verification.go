package utils

import (
    "fmt"
    "time"
)

func GenerateVerificationLink(userID string) (string, error) {
    token, err := GenerateToken(userID, time.Hour*24) // Token valid for 1 day
    if err != nil {
        return "", err
    }
    return fmt.Sprintf("http://localhost:3000/api/verify?token=%s", token), nil
}
