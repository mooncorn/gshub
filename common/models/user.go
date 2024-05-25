package models

import (
	"time"

	"gorm.io/gorm"
)

// UserRole defines a custom type for user roles
type UserRole string

// Constants for different user roles
const (
	Admin     UserRole = "ADMIN"
	Moderator UserRole = "MODERATOR"
	Default   UserRole = "USER"
)

// User represents a user in the system
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"` // Ensures email is unique and not null
	Role      UserRole       `gorm:"not null" json:"role"`              // Ensures role is not null
}
