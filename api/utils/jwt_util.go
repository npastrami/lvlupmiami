package utils

import (
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v4"
)

var secretKey = []byte("your_secret_key") // Make sure to replace with your actual secret key

type Claims struct {
    Username string `json:"username"`
    jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a given username and duration
func GenerateToken(username string, duration time.Duration) (string, error) {
    claims := &Claims{
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

// ParseToken parses a JWT token and returns the claims if valid
func ParseToken(tokenStr string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, errors.New("unexpected signing method")
        }
        return secretKey, nil
    })

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*Claims)
    if !ok || !token.Valid {
        return nil, errors.New("invalid token")
    }

    return claims, nil
}
