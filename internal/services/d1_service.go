package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/d1"
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.D1.Database.ListAutoPaging(context.Background(), d1.DatabaseListParams{
		AccountID: cloudflare.F(account.AccountID),
	})

	var result []D1DatabaseInfo
	for iter.Next() {
		db := iter.Current()
		info := D1DatabaseInfo{
			UUID:    db.UUID,
			Name:    db.Name,
			Version: db.Version,
		}
		if !db.CreatedAt.IsZero() {
			info.CreatedAt = db.CreatedAt.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list D1 databases: %w", err)
	}
	return result, nil
}

type CreateD1DatabaseRequest struct {
	Name string `json:"name" binding:"required"`
}

func (s *D1Service) CreateDatabase(accountID uint, name string) (*D1DatabaseInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	db, err := client.D1.Database.New(context.Background(), d1.DatabaseNewParams{
		AccountID: cloudflare.F(account.AccountID),
		Name:      cloudflare.F(name),
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.D1.Database.Delete(context.Background(), databaseID, d1.DatabaseDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	queryBody := d1.DatabaseQueryParamsBody{
		Sql: cloudflare.F(sql),
	}
	if len(params) > 0 {
		queryBody.Params = cloudflare.F[interface{}](params)
	}

	page, err := client.D1.Database.Query(context.Background(), databaseID, d1.DatabaseQueryParams{
		AccountID: cloudflare.F(account.AccountID),
		Body:      queryBody,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query D1 database: %w", err)
	}

	return page.Result, nil
}
