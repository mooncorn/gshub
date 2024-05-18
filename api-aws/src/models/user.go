package models

import (
	"gorm.io/gorm"
)

type Role string

const (
	Admin     Role = "admin"
	Moderator Role = "moderator"
	Default   Role = "user"
)

type User struct {
	gorm.Model
	Name    string
	Email   string `gorm:"uniqueIndex"`
	Role    Role
	Picture string
}
