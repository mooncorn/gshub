package models

import (
	"gorm.io/gorm"
)

type Instance struct {
	gorm.Model
	InstanceID   string
	InstanceType string
}
