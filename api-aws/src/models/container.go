package models

import (
	"gorm.io/gorm"
)

type Container struct {
	gorm.Model
	InstanceID  uint
	Instance    Instance
	ContainerID string
	Image       string
	Env         []string
	Ports       []string
	Volume      string
}
