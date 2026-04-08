package config

import (
	"os"
	"testing"
)

func TestLoadDefaults(t *testing.T) {
	for _, key := range []string{"PORT", "DATABASE_PATH", "JWT_SECRET", "ENCRYPTION_KEY", "ADMIN_USERNAME", "ADMIN_PASSWORD"} {
		os.Unsetenv(key)
	}

	cfg := Load()

	if cfg.Port != "8080" {
		t.Errorf("Port = %q, want %q", cfg.Port, "8080")
	}
	if cfg.DatabasePath != "data/cloudflare-manager.db" {
		t.Errorf("DatabasePath = %q, want %q", cfg.DatabasePath, "data/cloudflare-manager.db")
	}
	if cfg.JWTSecret != "change-me-in-production" {
		t.Errorf("JWTSecret = %q, want %q", cfg.JWTSecret, "change-me-in-production")
	}
	if cfg.EncryptionKey != "change-me-32-bytes-encryption!!" {
		t.Errorf("EncryptionKey = %q, want %q", cfg.EncryptionKey, "change-me-32-bytes-encryption!!")
	}
	if cfg.AdminUsername != "admin" {
		t.Errorf("AdminUsername = %q, want %q", cfg.AdminUsername, "admin")
	}
	if cfg.AdminPassword != "admin" {
		t.Errorf("AdminPassword = %q, want %q", cfg.AdminPassword, "admin")
	}
}

func TestLoadFromEnv(t *testing.T) {
	envVars := map[string]string{
		"PORT":           "9090",
		"DATABASE_PATH":  "/tmp/test.db",
		"JWT_SECRET":     "my-jwt-secret",
		"ENCRYPTION_KEY": "my-encryption-key-32-bytes!!!!!!",
		"ADMIN_USERNAME": "superadmin",
		"ADMIN_PASSWORD": "supersecret",
	}

	for k, v := range envVars {
		os.Setenv(k, v)
	}
	defer func() {
		for k := range envVars {
			os.Unsetenv(k)
		}
	}()

	cfg := Load()

	if cfg.Port != "9090" {
		t.Errorf("Port = %q, want %q", cfg.Port, "9090")
	}
	if cfg.DatabasePath != "/tmp/test.db" {
		t.Errorf("DatabasePath = %q, want %q", cfg.DatabasePath, "/tmp/test.db")
	}
	if cfg.JWTSecret != "my-jwt-secret" {
		t.Errorf("JWTSecret = %q, want %q", cfg.JWTSecret, "my-jwt-secret")
	}
	if cfg.EncryptionKey != "my-encryption-key-32-bytes!!!!!!" {
		t.Errorf("EncryptionKey = %q, want %q", cfg.EncryptionKey, "my-encryption-key-32-bytes!!!!!!")
	}
	if cfg.AdminUsername != "superadmin" {
		t.Errorf("AdminUsername = %q, want %q", cfg.AdminUsername, "superadmin")
	}
	if cfg.AdminPassword != "supersecret" {
		t.Errorf("AdminPassword = %q, want %q", cfg.AdminPassword, "supersecret")
	}
}

func TestGetEnvFallback(t *testing.T) {
	os.Unsetenv("NONEXISTENT_VAR")
	got := getEnv("NONEXISTENT_VAR", "fallback")
	if got != "fallback" {
		t.Errorf("getEnv() = %q, want %q", got, "fallback")
	}
}

func TestGetEnvSet(t *testing.T) {
	os.Setenv("TEST_VAR_CF", "custom-value")
	defer os.Unsetenv("TEST_VAR_CF")

	got := getEnv("TEST_VAR_CF", "fallback")
	if got != "custom-value" {
		t.Errorf("getEnv() = %q, want %q", got, "custom-value")
	}
}
