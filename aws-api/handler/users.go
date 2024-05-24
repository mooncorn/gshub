package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/mooncorn/gshub/common/model"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

func GetUser(ctx *gin.Context, db *gorm.DB) {
	email := ctx.MustGet("userEmail").(string)

	var user models.User
	if err := db.Where("Email = ?", email).First(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"User": user})
}

func SignIn(ctx *gin.Context, db *gorm.DB) {
	var req struct {
		IdToken string `json:"idToken"`
	}
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	payload, err := idtoken.Validate(ctx, req.IdToken, os.Getenv("GOOGLE_CLIENT_ID"))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	user := model.User{
		Subject: payload.Subject,
		Email:   payload.Claims["email"].(string),
		Name:    payload.Claims["name"].(string),
		Picture: payload.Claims["picture"].(string),
		Role:    models.Default,
	}

	var existingUser models.User
	if err := db.Where("Email = ?", user.Email).First(&existingUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// User does not exist, create a new one
			if err := db.Create(&user).Error; err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
				return
			}
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	} else {
		// User exists, update the user information
		if err := db.Model(&existingUser).Updates(user).Error; err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
			return
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":   user.Email,
		"role":    user.Role,
		"picture": user.Picture,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"Token": tokenString, "User": existingUser})
}
