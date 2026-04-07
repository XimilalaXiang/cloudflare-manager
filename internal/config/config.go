package config

import (
	"os"
)

type Config struct {
	Port          string
	DatabasePath  string
	JWTSecret     string
	EncryptionKey string // 32 bytes for AES-256
	AdminUsername string
	AdminPassword string
}

func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabasePath:  getEnv("DATABASE_PATH", "data/cloudflare-manager.db"),
		JWTSecret:     getEnv("JWT_SECRET", "change-me-in-production"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "change-me-32-bytes-encryption!!"),
		AdminUsername: getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
