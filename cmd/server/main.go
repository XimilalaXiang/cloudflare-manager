package main

import (
	"log"

	"github.com/ximilala/cloudflare-manager/internal/config"
	"github.com/ximilala/cloudflare-manager/internal/database"
	"github.com/ximilala/cloudflare-manager/internal/handlers"
	"github.com/ximilala/cloudflare-manager/internal/middleware"
	"github.com/ximilala/cloudflare-manager/internal/models"
	"github.com/ximilala/cloudflare-manager/internal/services"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()

	if err := database.Init(cfg.DatabasePath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	ensureAdminUser(cfg.AdminUsername, cfg.AdminPassword)

	middleware.SetJWTSecret(cfg.JWTSecret)

	accountService := services.NewAccountService(cfg.EncryptionKey)
	workerService := services.NewWorkerService(accountService)
	zoneService := services.NewZoneService(accountService)
	routeService := services.NewRouteService(accountService)
	kvService := services.NewKVService(accountService)
	d1Service := services.NewD1Service(accountService)
	r2Service := services.NewR2Service(accountService)
	pagesService := services.NewPagesService(accountService)
	emailRoutingService := services.NewEmailRoutingService(accountService)

	router := handlers.SetupRouter(
		accountService,
		workerService,
		zoneService,
		routeService,
		kvService,
		d1Service,
		r2Service,
		pagesService,
		emailRoutingService,
	)

	log.Printf("Server starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func ensureAdminUser(username, password string) {
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash admin password: %v", err)
	}

	admin := models.User{
		Username: username,
		Password: string(hashed),
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}
	log.Printf("Admin user '%s' created", username)
}
