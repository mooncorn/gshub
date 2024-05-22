package models

import (
	"gorm.io/gorm"
)

type Server struct {
	gorm.Model
	InstanceID string
	Name       string
}
