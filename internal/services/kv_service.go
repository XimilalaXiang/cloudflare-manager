package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type KVService struct {
	accountService *AccountService
}

func NewKVService(accountService *AccountService) *KVService {
	return &KVService{accountService: accountService}
}

type KVNamespaceInfo struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

func (s *KVService) ListNamespaces(accountID uint) ([]KVNamespaceInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	resp, _, err := api.ListWorkersKVNamespaces(context.Background(), rc, cloudflare.ListWorkersKVNamespacesParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list KV namespaces: %w", err)
	}

	namespaces := make([]KVNamespaceInfo, 0, len(resp))
	for _, ns := range resp {
		namespaces = append(namespaces, KVNamespaceInfo{
			ID:    ns.ID,
			Title: ns.Title,
		})
	}
	return namespaces, nil
}

type CreateKVNamespaceRequest struct {
	Title string `json:"title" binding:"required"`
}

func (s *KVService) CreateNamespace(accountID uint, title string) (*KVNamespaceInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	resp, err := api.CreateWorkersKVNamespace(context.Background(), rc, cloudflare.CreateWorkersKVNamespaceParams{
		Title: title,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create KV namespace: %w", err)
	}

	return &KVNamespaceInfo{
		ID:    resp.Result.ID,
		Title: resp.Result.Title,
	}, nil
}

func (s *KVService) DeleteNamespace(accountID uint, namespaceID string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	_, err = api.DeleteWorkersKVNamespace(context.Background(), rc, namespaceID)
	if err != nil {
		return fmt.Errorf("failed to delete KV namespace: %w", err)
	}
	return nil
}

type KVKeyInfo struct {
	Name       string `json:"name"`
	Expiration int    `json:"expiration,omitempty"`
}

func (s *KVService) ListKeys(accountID uint, namespaceID string, cursor string, limit int) ([]KVKeyInfo, string, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, "", err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	params := cloudflare.ListWorkersKVsParams{
		NamespaceID: namespaceID,
	}
	if limit > 0 {
		params.Limit = limit
	}
	if cursor != "" {
		params.Cursor = cursor
	}

	resp, err := api.ListWorkersKVKeys(context.Background(), rc, params)
	if err != nil {
		return nil, "", fmt.Errorf("failed to list KV keys: %w", err)
	}

	keys := make([]KVKeyInfo, 0, len(resp.Result))
	for _, k := range resp.Result {
		keys = append(keys, KVKeyInfo{
			Name:       k.Name,
			Expiration: k.Expiration,
		})
	}
	return keys, resp.Cursor, nil
}

func (s *KVService) GetValue(accountID uint, namespaceID, key string) ([]byte, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	value, err := api.GetWorkersKV(context.Background(), rc, cloudflare.GetWorkersKVParams{
		NamespaceID: namespaceID,
		Key:         key,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get KV value: %w", err)
	}
	return value, nil
}

func (s *KVService) PutValue(accountID uint, namespaceID, key string, value []byte) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	_, err = api.WriteWorkersKVEntry(context.Background(), rc, cloudflare.WriteWorkersKVEntryParams{
		NamespaceID: namespaceID,
		Key:         key,
		Value:       value,
	})
	if err != nil {
		return fmt.Errorf("failed to put KV value: %w", err)
	}
	return nil
}

func (s *KVService) DeleteKey(accountID uint, namespaceID, key string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	_, err = api.DeleteWorkersKVEntry(context.Background(), rc, cloudflare.DeleteWorkersKVEntryParams{
		NamespaceID: namespaceID,
		Key:         key,
	})
	if err != nil {
		return fmt.Errorf("failed to delete KV key: %w", err)
	}
	return nil
}
