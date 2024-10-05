package utils

import (
    "time"
    "github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("your_secret_key")

func GenerateToken(userID string, expirationTime time.Duration) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "id":  userID,
        "exp": time.Now().Add(expirationTime).Unix(),
    })

    return token.SignedString(jwtKey)
}
