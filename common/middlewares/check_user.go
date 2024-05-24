package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// CheckUser middleware checks for the authorization header and attaches the user's email to the context.
func CheckUser(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.Next()
		return
	}

	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		c.Next()
		return
	}

	tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		c.Next()
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if email, exists := claims["email"].(string); exists {
			c.Set("userEmail", email)
		}
	}

	c.Next()
}

// AuthMiddleware is a Gin middleware function for JWT authentication
func AuthMiddleware(c *gin.Context) {
	// Retrieve the Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
		c.Abort()
		return
	}

	// Check if the token has the correct prefix and extract the token part
	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
		c.Abort()
		return
	}

	tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

	// Parse the JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to parse token: " + err.Error()})
		c.Abort()
		return
	}

	// Validate the token and set the user email in the context
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if email, exists := claims["email"]; exists {
			c.Set("userEmail", email)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email claim is missing in the token"})
			c.Abort()
			return
		}
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return
	}

	// Proceed to the next handler if the token is valid
	c.Next()
}
