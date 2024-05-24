package models

// Service represents a service that can be part of a plan
type Service struct {
	ID       string `gorm:"primaryKey"` // Unique identifier
	MinMem   int    `gorm:"not null"`   // Minimum memory required in MB
	RecMem   int    `gorm:"not null"`   // Recommended memory in MB
	Name     string `gorm:"not null"`   // Short name of the service
	NameLong string `gorm:"not null"`   // Full name of the service
}
