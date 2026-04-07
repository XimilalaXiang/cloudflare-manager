package models

import (
	"time"

	"gorm.io/gorm"
)

type Account struct {
	ID             uint           `json:"id" gorm:"primarykey"`
	Name           string         `json:"name" gorm:"not null"`
	Email          string         `json:"email"`
	AccountID      string         `json:"account_id" gorm:"uniqueIndex;not null"`
	APIToken       string         `json:"-" gorm:"not null"` // encrypted, never exposed in JSON
	APITokenMasked string         `json:"api_token_masked" gorm:"-"`
	Status         string         `json:"status" gorm:"default:unknown"` // active, inactive, unknown
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

type User struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // bcrypt hashed
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AuditLog struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	UserID    uint      `json:"user_id"`
	AccountID uint      `json:"account_id"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	Detail    string    `json:"detail"`
	CreatedAt time.Time `json:"created_at"`
}
