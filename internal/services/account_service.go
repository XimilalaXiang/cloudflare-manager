package services

import (
	"context"
	"fmt"
	"strings"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/accounts"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/ximilala/cloudflare-manager/internal/database"
	"github.com/ximilala/cloudflare-manager/internal/models"
	"github.com/ximilala/cloudflare-manager/pkg/crypto"
)

type AccountService struct {
	encryptionKey string
}

func NewAccountService(encryptionKey string) *AccountService {
	return &AccountService{encryptionKey: encryptionKey}
}

func (s *AccountService) Create(name, email, accountID, apiToken string) (*models.Account, error) {
	if err := s.verifyToken(apiToken, accountID); err != nil {
		return nil, fmt.Errorf("token verification failed: %w", err)
	}

	encrypted, err := crypto.Encrypt(apiToken, s.encryptionKey)
	if err != nil {
		return nil, fmt.Errorf("encryption failed: %w", err)
	}

	account := &models.Account{
		Name:      name,
		Email:     email,
		AccountID: accountID,
		APIToken:  encrypted,
		Status:    "active",
	}

	if err := database.DB.Create(account).Error; err != nil {
		return nil, err
	}

	account.APITokenMasked = maskToken(apiToken)
	return account, nil
}

func (s *AccountService) List() ([]models.Account, error) {
	var accounts []models.Account
	if err := database.DB.Find(&accounts).Error; err != nil {
		return nil, err
	}
	for i := range accounts {
		token, err := crypto.Decrypt(accounts[i].APIToken, s.encryptionKey)
		if err == nil {
			accounts[i].APITokenMasked = maskToken(token)
		}
	}
	return accounts, nil
}

func (s *AccountService) GetByID(id uint) (*models.Account, error) {
	var account models.Account
	if err := database.DB.First(&account, id).Error; err != nil {
		return nil, err
	}
	token, err := crypto.Decrypt(account.APIToken, s.encryptionKey)
	if err == nil {
		account.APITokenMasked = maskToken(token)
	}
	return &account, nil
}

func (s *AccountService) Update(id uint, name, email, apiToken string) (*models.Account, error) {
	var account models.Account
	if err := database.DB.First(&account, id).Error; err != nil {
		return nil, err
	}

	if name != "" {
		account.Name = name
	}
	if email != "" {
		account.Email = email
	}
	if apiToken != "" {
		if err := s.verifyToken(apiToken, account.AccountID); err != nil {
			return nil, fmt.Errorf("token verification failed: %w", err)
		}
		encrypted, err := crypto.Encrypt(apiToken, s.encryptionKey)
		if err != nil {
			return nil, fmt.Errorf("encryption failed: %w", err)
		}
		account.APIToken = encrypted
	}

	if err := database.DB.Save(&account).Error; err != nil {
		return nil, err
	}

	token, _ := crypto.Decrypt(account.APIToken, s.encryptionKey)
	account.APITokenMasked = maskToken(token)
	return &account, nil
}

func (s *AccountService) Delete(id uint) error {
	return database.DB.Delete(&models.Account{}, id).Error
}

func (s *AccountService) Verify(id uint) (string, error) {
	account, err := s.GetByID(id)
	if err != nil {
		return "", err
	}
	token, err := crypto.Decrypt(account.APIToken, s.encryptionKey)
	if err != nil {
		return "", err
	}
	if err := s.verifyToken(token, account.AccountID); err != nil {
		database.DB.Model(account).Update("status", "inactive")
		return "inactive", err
	}
	database.DB.Model(account).Update("status", "active")
	return "active", nil
}

func (s *AccountService) GetCFClient(accountID uint) (*cloudflare.Client, *models.Account, error) {
	account, err := s.GetByID(accountID)
	if err != nil {
		return nil, nil, fmt.Errorf("account not found: %w", err)
	}
	token, err := crypto.Decrypt(account.APIToken, s.encryptionKey)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to decrypt token: %w", err)
	}
	client := cloudflare.NewClient(option.WithAPIToken(token))
	return client, account, nil
}

func (s *AccountService) verifyToken(token, accountID string) error {
	client := cloudflare.NewClient(option.WithAPIToken(token))
	_, err := client.Accounts.Get(context.Background(), accounts.AccountGetParams{
		AccountID: cloudflare.F(accountID),
	})
	return err
}

func maskToken(token string) string {
	if len(token) <= 8 {
		return strings.Repeat("*", len(token))
	}
	return token[:4] + strings.Repeat("*", len(token)-8) + token[len(token)-4:]
}
