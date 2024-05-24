package models

import "gorm.io/gorm"

// Service represents a service that can be part of a plan
type Service struct {
	gorm.Model
	NameID   string `gorm:"uniqueIndex"` // Unique identifier
	MinMem   int    `gorm:"not null"`    // Minimum memory required in MB
	RecMem   int    `gorm:"not null"`    // Recommended memory in MB
	Name     string `gorm:"not null"`    // Short name of the service
	NameLong string `gorm:"not null"`    // Full name of the service
	Image    string `gorm:"not null"`    // Image of the docker container
	Env      string
	Volume   string `gorm:"not null"`
	Ports    string `gorm:"not null"`
}
