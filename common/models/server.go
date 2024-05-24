package models

import (
	"gorm.io/gorm"
)

// Server represents a server instance in the system
type Server struct {
	gorm.Model
	ServiceID  uint   `gorm:"not null"` // Reference to the service
	PlanID     uint   `gorm:"not null"` // Reference to the plan
	UserID     uint   `gorm:"not null"` // Reference to the user
	InstanceID string `gorm:"not null"` // EC2 instance id
}
