package controllers

import (
	"dasior/cloudservers/src/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateUserData struct {
	Name    string
	Email   string
	Picture string
}

func GetUser(ctx *gin.Context, db *gorm.DB) {
	user, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"user": user})
}

func CreateUser(ctx *gin.Context, db *gorm.DB) {
	var req CreateUserData

	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// TODO: validate user data individually

	user := models.User{
		Name:    req.Name,
		Email:   req.Email,
		Role:    models.Default,
		Picture: req.Picture,
	}

	tx := db.Save(&user)

	if tx.Error != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": fmt.Errorf("failed to create user: %v", tx.Error.Error())})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"user": user})
}
