package services

import (
	"context"
	"fmt"
	"io"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/kv"
	"github.com/cloudflare/cloudflare-go/v6/shared"
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.KV.Namespaces.ListAutoPaging(context.Background(), kv.NamespaceListParams{
		AccountID: cloudflare.F(account.AccountID),
	})

	var namespaces []KVNamespaceInfo
	for iter.Next() {
		ns := iter.Current()
		namespaces = append(namespaces, KVNamespaceInfo{
			ID:    ns.ID,
			Title: ns.Title,
		})
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list KV namespaces: %w", err)
	}
	return namespaces, nil
}

type CreateKVNamespaceRequest struct {
	Title string `json:"title" binding:"required"`
}

func (s *KVService) CreateNamespace(accountID uint, title string) (*KVNamespaceInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	ns, err := client.KV.Namespaces.New(context.Background(), kv.NamespaceNewParams{
		AccountID: cloudflare.F(account.AccountID),
		Title:     cloudflare.F(title),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create KV namespace: %w", err)
	}

	return &KVNamespaceInfo{
		ID:    ns.ID,
		Title: ns.Title,
	}, nil
}

func (s *KVService) DeleteNamespace(accountID uint, namespaceID string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.KV.Namespaces.Delete(context.Background(), namespaceID, kv.NamespaceDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, "", err
	}

	params := kv.NamespaceKeyListParams{
		AccountID: cloudflare.F(account.AccountID),
	}
	if limit > 0 {
		params.Limit = cloudflare.F(float64(limit))
	}
	if cursor != "" {
		params.Cursor = cloudflare.F(cursor)
	}

	page, err := client.KV.Namespaces.Keys.List(context.Background(), namespaceID, params)
	if err != nil {
		return nil, "", fmt.Errorf("failed to list KV keys: %w", err)
	}

	var keys []KVKeyInfo
	for _, k := range page.Result {
		keys = append(keys, KVKeyInfo{
			Name:       k.Name,
			Expiration: int(k.Expiration),
		})
	}

	nextCursor := ""
	if page.ResultInfo.Cursor != "" {
		nextCursor = page.ResultInfo.Cursor
	}
	return keys, nextCursor, nil
}

func (s *KVService) GetValue(accountID uint, namespaceID, key string) ([]byte, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	resp, err := client.KV.Namespaces.Values.Get(context.Background(), namespaceID, key, kv.NamespaceValueGetParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get KV value: %w", err)
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

func (s *KVService) PutValue(accountID uint, namespaceID, key string, value []byte) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.KV.Namespaces.Values.Update(context.Background(), namespaceID, key, kv.NamespaceValueUpdateParams{
		AccountID: cloudflare.F(account.AccountID),
		Value:     cloudflare.F[kv.NamespaceValueUpdateParamsValueUnion](shared.UnionString(string(value))),
	})
	if err != nil {
		return fmt.Errorf("failed to put KV value: %w", err)
	}
	return nil
}

func (s *KVService) DeleteKey(accountID uint, namespaceID, key string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.KV.Namespaces.Values.Delete(context.Background(), namespaceID, key, kv.NamespaceValueDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete KV key: %w", err)
	}
	return nil
}
