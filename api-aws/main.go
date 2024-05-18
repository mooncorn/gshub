package main

import (
	"dasior/cloudservers/src/controllers"
	"dasior/cloudservers/src/lib"
	"dasior/cloudservers/src/middlewares"
	"log"
	"os"
	"time"

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

	db := lib.SetupDatabase()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           time.Hour * 24 * 30, // 30 days
	}))

	r.POST("/users", func(ctx *gin.Context) {
		controllers.CreateUser(ctx, db)
	})

	r.GET("/instances", func(ctx *gin.Context) {
		middlewares.Auth(ctx, db)
	}, controllers.GetInstances)

	r.GET("/instances/:id", controllers.GetInstance)

	r.POST("/instances", controllers.CreateInstance)

	r.PUT("/instances/:id", controllers.UpdateInstance)

	r.DELETE("/instances/:id", controllers.DeleteInstance)

	r.POST("/instances/:id/start", controllers.StartInstance)

	r.POST("/instances/:id/stop", controllers.StopInstance)

	r.POST("/instances/:id/container", controllers.CreateContainer)

	r.GET("/instances/:id/container", controllers.GetContainer)

	r.POST("/instances/:id/container/start", controllers.StartContainer)

	r.POST("/instances/:id/container/stop", controllers.StopContainer)

	r.DELETE("/instances/:id/container", controllers.DeleteContainer)

	r.Run(":" + port)
}
