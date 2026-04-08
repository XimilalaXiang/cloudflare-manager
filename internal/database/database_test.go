package database

import (
	"path/filepath"
	"testing"
)

func TestInitCreatesDatabase(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "subdir", "test.db")

	if err := Init(dbPath); err != nil {
		t.Fatalf("Init() error = %v", err)
	}

	if DB == nil {
		t.Fatal("DB should not be nil after Init")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		t.Fatalf("DB.DB() error = %v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("Ping() error = %v", err)
	}
}

func TestInitAutoMigrates(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")

	if err := Init(dbPath); err != nil {
		t.Fatalf("Init() error = %v", err)
	}

	tables := []string{"accounts", "users", "audit_logs"}
	for _, table := range tables {
		if !DB.Migrator().HasTable(table) {
			t.Errorf("table %q should exist after Init", table)
		}
	}
}
