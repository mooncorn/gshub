package models

import "gorm.io/gorm"

// Plan represents a instance type in the system
type Plan struct {
	gorm.Model
	InstanceType string  `gorm:"not null"` // Type of instance
	Name         string  `gorm:"not null"` // Name of the plan
	VCores       int     `gorm:"not null"` // Number of virtual cores
	Memory       int     `gorm:"not null"` // Amount of memory in MB
	Price        float64 `gorm:"not null"` // Price of the plan per month
	Disk         int     `gorm:"not null"` // Disk space in GB
	Enabled      bool    `gorm:"not null"` // Indicates if the plan is enabled
}
