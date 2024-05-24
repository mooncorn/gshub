package db

import "gorm.io/gorm"

// Database interface defines the methods you expect for database operations
type Database interface {
	GetDB() *gorm.DB
	Close() error
}

var instance Database

// SetDatabase sets the current database instance
func SetDatabase(db Database) {
	instance = db
}

// GetDatabase returns the current database instance
func GetDatabase() Database {
	return instance
}

// Example function to close the database connection
func Close() error {
	if instance != nil {
		return instance.Close()
	}
	return nil
}
