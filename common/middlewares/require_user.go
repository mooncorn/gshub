package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireUser middleware ensures that the user's email is present in the context.
func RequireUser(c *gin.Context) {
	_, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		c.Abort()
		return
	}

	c.Next()
}
