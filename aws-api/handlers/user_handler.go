package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/mooncorn/gshub/common/db"
	"github.com/mooncorn/gshub/common/models"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

// GetUser retrieves the user information from the database based on the email stored in the context.
func GetUser(c *gin.Context) {
	// Retrieve the user email from the context
	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	// Cast the user email to string
	email, ok := userEmail.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user email format"})
		return
	}

	// Fetch the user information from the database
	instance := db.GetDatabase()
	var user models.User
	if err := instance.GetDB().Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Return the user information as JSON
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// SignIn handles user sign-in, validates the ID token, and creates or updates the user in the database.
func SignIn(c *gin.Context) {
	// Request structure for binding JSON input
	var request struct {
		IDToken string `json:"idToken"`
	}

	// Bind JSON input to the request structure
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate the ID token
	payload, err := idtoken.Validate(c, request.IDToken, os.Getenv("GOOGLE_CLIENT_ID"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Extract email from token payload
	email, ok := payload.Claims["email"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found in token"})
		return
	}

	// Create a new user instance
	user := models.User{
		Email: email,
		Role:  models.Default,
	}

	// Check if the user already exists in the database
	instance := db.GetDatabase()
	var existingUser models.User
	if err := instance.GetDB().Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// User does not exist, create a new user
			if err := instance.GetDB().Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
				return
			}
		} else {
			// Database error occurred
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	} else {
		// User exists, update the user information
		if err := instance.GetDB().Model(&existingUser).Updates(user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
			return
		}
	}

	// Generate JWT token for the user
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	})

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Respond with the token and user information
	c.JSON(http.StatusOK, gin.H{"token": tokenString, "user": existingUser})
}
