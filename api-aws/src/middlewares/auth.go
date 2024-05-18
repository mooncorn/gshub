package middlewares

import (
	"dasior/cloudservers/src/models"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// func Auth(c *gin.Context) {
// 	tokenString, err := c.Cookie("auth_token")
// 	if err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
// 		c.Abort()
// 		return
// 	}

// 	claims := jwt.MapClaims{}

// 	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
// 		return []byte(os.Getenv("JWT_SECRET")), nil
// 	})

// 	if err != nil || !token.Valid {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
// 		c.Abort()
// 		return
// 	}

// 	c.Set("user_id", claims["user_id"])
// 	c.Next()
// }

type Claims struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Role    string `json:"role"`
	Picture string `json:"picture"`
	jwt.StandardClaims
}

func Auth(c *gin.Context, db *gorm.DB) {
	tokenString, err := c.Cookie("next-auth.session-token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		c.Abort()
		return
	}

	fmt.Println(tokenString)

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return
	}

	// Convert string ID to uint
	idUint, err := strconv.ParseUint(claims.Id, 10, 32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		c.Abort()
		return
	}

	var user models.User
	if err := db.First(&user, idUint).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		c.Abort()
		return
	}

	c.Set("user", &user)
	c.Next()
}
