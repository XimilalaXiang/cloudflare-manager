package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestGenerateTokenAndParse(t *testing.T) {
	SetJWTSecret("test-secret-key")

	token, err := GenerateToken(42, "testuser")
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}
	if token == "" {
		t.Fatal("GenerateToken() returned empty token")
	}

	claims := &Claims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		t.Fatalf("ParseWithClaims() error = %v", err)
	}
	if !parsed.Valid {
		t.Fatal("parsed token is not valid")
	}
	if claims.UserID != 42 {
		t.Errorf("UserID = %d, want %d", claims.UserID, 42)
	}
	if claims.Username != "testuser" {
		t.Errorf("Username = %q, want %q", claims.Username, "testuser")
	}
}

func TestAuthRequiredNoHeader(t *testing.T) {
	SetJWTSecret("test-secret")

	w := httptest.NewRecorder()
	c, r := gin.CreateTestContext(w)

	r.Use(AuthRequired())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	c.Request, _ = http.NewRequest("GET", "/protected", nil)
	r.ServeHTTP(w, c.Request)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthRequiredNoBearerPrefix(t *testing.T) {
	SetJWTSecret("test-secret")

	w := httptest.NewRecorder()
	c, r := gin.CreateTestContext(w)

	r.Use(AuthRequired())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	c.Request, _ = http.NewRequest("GET", "/protected", nil)
	c.Request.Header.Set("Authorization", "Basic some-token")
	r.ServeHTTP(w, c.Request)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthRequiredInvalidToken(t *testing.T) {
	SetJWTSecret("test-secret")

	w := httptest.NewRecorder()
	c, r := gin.CreateTestContext(w)

	r.Use(AuthRequired())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	c.Request, _ = http.NewRequest("GET", "/protected", nil)
	c.Request.Header.Set("Authorization", "Bearer invalid-token-here")
	r.ServeHTTP(w, c.Request)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthRequiredValidToken(t *testing.T) {
	SetJWTSecret("test-secret")

	token, _ := GenerateToken(1, "admin")

	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	var gotUserID interface{}
	var gotUsername interface{}

	r.Use(AuthRequired())
	r.GET("/protected", func(c *gin.Context) {
		gotUserID, _ = c.Get("user_id")
		gotUsername, _ = c.Get("username")
		c.JSON(200, gin.H{"ok": true})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
	if gotUserID != uint(1) {
		t.Errorf("user_id = %v, want %v", gotUserID, uint(1))
	}
	if gotUsername != "admin" {
		t.Errorf("username = %v, want %q", gotUsername, "admin")
	}
}

func TestAuthRequiredExpiredToken(t *testing.T) {
	SetJWTSecret("test-secret")

	claims := Claims{
		UserID:   1,
		Username: "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString(jwtSecret)

	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(AuthRequired())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+tokenStr)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}
