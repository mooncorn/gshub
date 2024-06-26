package main

import (
	"log"
	"os"

	"github.com/mooncorn/gshub/aws-api/handlers"
	"github.com/mooncorn/gshub/common/db"
	"github.com/mooncorn/gshub/common/middlewares"
	"github.com/mooncorn/gshub/common/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	port := os.Getenv("PORT")
	dsn := os.Getenv("DSN")

	gormDB := db.NewGormDB(dsn)
	db.SetDatabase(gormDB)

	// AutoMigrate the models
	err = db.GetDatabase().GetDB().AutoMigrate(&models.Plan{}, &models.Service{}, &models.Server{}, &models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	r := gin.Default()

	// Middlewares
	r.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"http://localhost:3000"},
		ExposeHeaders: []string{"Content-Length"},
		AllowHeaders:  []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
	}))
	r.Use(middlewares.CheckUser)

	// Public routes
	r.POST("/signin", handlers.SignIn)
	r.GET("/user", middlewares.RequireUser, handlers.GetUser)

	// Protected routes
	r.GET("/metadata", middlewares.RequireUser, handlers.GetMetadata)
	r.POST("/instances", middlewares.RequireUser, handlers.CreateInstance)
	r.GET("/instances", middlewares.RequireUser, handlers.GetInstances)

	r.Run(":" + port)
}
