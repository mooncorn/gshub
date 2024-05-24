package models

import (
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
	gorm.Model
	Email string   `gorm:"uniqueIndex;not null"`                                            // Ensures email is unique and not null
	Role  UserRole `gorm:"type:ENUM('ADMIN', 'MODERATOR', 'USER');default:'USER';not null"` // Ensures role is one of the predefined values and defaults to 'USER'
}
