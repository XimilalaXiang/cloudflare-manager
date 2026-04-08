package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/ximilala/cloudflare-manager/internal/database"
	"github.com/ximilala/cloudflare-manager/internal/middleware"
	"github.com/ximilala/cloudflare-manager/internal/models"
	"github.com/ximilala/cloudflare-manager/internal/services"
	"golang.org/x/crypto/bcrypt"
)

const testEncryptionKey = "test-encryption-key-32-bytes!!!!"

func setupTestDB(t *testing.T) func() {
	t.Helper()
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")
	if err := database.Init(dbPath); err != nil {
		t.Fatalf("Failed to init test database: %v", err)
	}
	return func() {
		os.Remove(dbPath)
	}
}

func createTestUser(t *testing.T, username, password string) {
	t.Helper()
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	user := models.User{Username: username, Password: string(hashed)}
	if err := database.DB.Create(&user).Error; err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}
}

func getTestToken(t *testing.T, username, password string) string {
	t.Helper()
	createTestUser(t, username, password)

	var user models.User
	database.DB.Where("username = ?", username).First(&user)

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}
	return token
}

func setupTestRouter(t *testing.T) (*httptest.Server, string) {
	t.Helper()
	cleanup := setupTestDB(t)
	t.Cleanup(cleanup)

	middleware.SetJWTSecret("test-jwt-secret")

	accountService := services.NewAccountService(testEncryptionKey)
	workerService := services.NewWorkerService(accountService)
	zoneService := services.NewZoneService(accountService)
	routeService := services.NewRouteService(accountService)
	kvService := services.NewKVService(accountService)
	d1Service := services.NewD1Service(accountService)
	r2Service := services.NewR2Service(accountService)

	router := SetupRouter(accountService, workerService, zoneService, routeService, kvService, d1Service, r2Service)
	server := httptest.NewServer(router)

	token := getTestToken(t, "admin", "password123")
	return server, token
}

func TestLoginSuccess(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()
	middleware.SetJWTSecret("test-jwt-secret")

	accountService := services.NewAccountService(testEncryptionKey)
	workerService := services.NewWorkerService(accountService)
	zoneService := services.NewZoneService(accountService)
	routeService := services.NewRouteService(accountService)
	kvService := services.NewKVService(accountService)
	d1Service := services.NewD1Service(accountService)
	r2Service := services.NewR2Service(accountService)

	router := SetupRouter(accountService, workerService, zoneService, routeService, kvService, d1Service, r2Service)

	createTestUser(t, "admin", "password123")

	body, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "password123",
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Login status = %d, want %d. Body: %s", w.Code, http.StatusOK, w.Body.String())
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["token"] == nil || resp["token"] == "" {
		t.Error("Login response should contain a token")
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()
	middleware.SetJWTSecret("test-jwt-secret")

	accountService := services.NewAccountService(testEncryptionKey)
	workerService := services.NewWorkerService(accountService)
	zoneService := services.NewZoneService(accountService)
	routeService := services.NewRouteService(accountService)
	kvService := services.NewKVService(accountService)
	d1Service := services.NewD1Service(accountService)
	r2Service := services.NewR2Service(accountService)

	router := SetupRouter(accountService, workerService, zoneService, routeService, kvService, d1Service, r2Service)

	createTestUser(t, "admin", "password123")

	body, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "wrong-password",
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Login status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestLoginMissingFields(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()
	middleware.SetJWTSecret("test-jwt-secret")

	accountService := services.NewAccountService(testEncryptionKey)
	workerService := services.NewWorkerService(accountService)
	zoneService := services.NewZoneService(accountService)
	routeService := services.NewRouteService(accountService)
	kvService := services.NewKVService(accountService)
	d1Service := services.NewD1Service(accountService)
	r2Service := services.NewR2Service(accountService)

	router := SetupRouter(accountService, workerService, zoneService, routeService, kvService, d1Service, r2Service)

	body, _ := json.Marshal(map[string]string{
		"username": "admin",
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Login status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestMeEndpoint(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("GET", server.URL+"/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Me status = %d, want %d", resp.StatusCode, http.StatusOK)
	}

	var body map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&body)
	if body["username"] != "admin" {
		t.Errorf("username = %v, want %q", body["username"], "admin")
	}
}

func TestMeWithoutAuth(t *testing.T) {
	server, _ := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("GET", server.URL+"/api/auth/me", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Me status = %d, want %d", resp.StatusCode, http.StatusUnauthorized)
	}
}

func TestChangePassword(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	body, _ := json.Marshal(map[string]string{
		"old_password": "password123",
		"new_password": "newpass456",
	})

	req, _ := http.NewRequest("POST", server.URL+"/api/auth/change-password", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("ChangePassword status = %d, want %d", resp.StatusCode, http.StatusOK)
	}
}

func TestChangePasswordWrongOld(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	body, _ := json.Marshal(map[string]string{
		"old_password": "wrong-old-password",
		"new_password": "newpass456",
	})

	req, _ := http.NewRequest("POST", server.URL+"/api/auth/change-password", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("ChangePassword status = %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
}

func TestAccountListEmpty(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("GET", server.URL+"/api/accounts", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}

	var accounts []interface{}
	json.NewDecoder(resp.Body).Decode(&accounts)
	if len(accounts) != 0 {
		t.Errorf("accounts length = %d, want 0", len(accounts))
	}
}

func TestAccountGetInvalidID(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("GET", server.URL+"/api/accounts/abc", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
}

func TestAccountGetNotFound(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("GET", server.URL+"/api/accounts/999", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusNotFound)
	}
}

func TestAccountDeleteNotFound(t *testing.T) {
	server, token := setupTestRouter(t)
	defer server.Close()

	req, _ := http.NewRequest("DELETE", server.URL+"/api/accounts/999", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Request error: %v", err)
	}
	defer resp.Body.Close()

	// GORM soft delete on non-existent ID still returns OK
	if resp.StatusCode != http.StatusOK {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}
}

func TestProtectedEndpointsRequireAuth(t *testing.T) {
	server, _ := setupTestRouter(t)
	defer server.Close()

	endpoints := []struct {
		method string
		path   string
	}{
		{"GET", "/api/auth/me"},
		{"POST", "/api/auth/change-password"},
		{"GET", "/api/accounts"},
		{"POST", "/api/accounts"},
		{"GET", "/api/accounts/1"},
		{"PUT", "/api/accounts/1"},
		{"DELETE", "/api/accounts/1"},
	}

	for _, ep := range endpoints {
		t.Run(ep.method+" "+ep.path, func(t *testing.T) {
			req, _ := http.NewRequest(ep.method, server.URL+ep.path, nil)
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				t.Fatalf("Request error: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusUnauthorized {
				t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusUnauthorized)
			}
		})
	}
}
