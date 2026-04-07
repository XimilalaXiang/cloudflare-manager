package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type D1Service struct {
	accountService *AccountService
}

func NewD1Service(accountService *AccountService) *D1Service {
	return &D1Service{accountService: accountService}
}

type D1DatabaseInfo struct {
	UUID      string `json:"uuid"`
	Name      string `json:"name"`
	Version   string `json:"version"`
	NumTables int    `json:"num_tables"`
	FileSize  int64  `json:"file_size"`
	CreatedAt string `json:"created_at,omitempty"`
}

func (s *D1Service) ListDatabases(accountID uint) ([]D1DatabaseInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	dbs, _, err := api.ListD1Databases(context.Background(), rc, cloudflare.ListD1DatabasesParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list D1 databases: %w", err)
	}

	result := make([]D1DatabaseInfo, 0, len(dbs))
	for _, db := range dbs {
		createdAt := ""
		if db.CreatedAt != nil {
			createdAt = db.CreatedAt.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, D1DatabaseInfo{
			UUID:      db.UUID,
			Name:      db.Name,
			Version:   db.Version,
			NumTables: db.NumTables,
			FileSize:  db.FileSize,
			CreatedAt: createdAt,
		})
	}
	return result, nil
}

type CreateD1DatabaseRequest struct {
	Name string `json:"name" binding:"required"`
}

func (s *D1Service) CreateDatabase(accountID uint, name string) (*D1DatabaseInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	db, err := api.CreateD1Database(context.Background(), rc, cloudflare.CreateD1DatabaseParams{
		Name: name,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create D1 database: %w", err)
	}

	return &D1DatabaseInfo{
		UUID: db.UUID,
		Name: db.Name,
	}, nil
}

func (s *D1Service) DeleteDatabase(accountID uint, databaseID string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	err = api.DeleteD1Database(context.Background(), rc, databaseID)
	if err != nil {
		return fmt.Errorf("failed to delete D1 database: %w", err)
	}
	return nil
}

type D1QueryRequest struct {
	SQL    string   `json:"sql" binding:"required"`
	Params []string `json:"params"`
}

func (s *D1Service) QueryDatabase(accountID uint, databaseID string, sql string, params []string) (interface{}, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	result, err := api.QueryD1Database(context.Background(), rc, cloudflare.QueryD1DatabaseParams{
		DatabaseID: databaseID,
		SQL:        sql,
		Parameters: params,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query D1 database: %w", err)
	}
	return result, nil
}
