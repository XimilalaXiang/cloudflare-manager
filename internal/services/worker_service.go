package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type WorkerService struct {
	accountService *AccountService
}

func NewWorkerService(accountService *AccountService) *WorkerService {
	return &WorkerService{accountService: accountService}
}

type WorkerScript struct {
	ID         string `json:"id"`
	ETag       string `json:"etag,omitempty"`
	Size       int    `json:"size,omitempty"`
	CreatedOn  string `json:"created_on,omitempty"`
	ModifiedOn string `json:"modified_on,omitempty"`
}

type WorkerDeployRequest struct {
	ScriptName string            `json:"script_name" binding:"required"`
	Content    string            `json:"content" binding:"required"`
	Bindings   map[string]string `json:"bindings,omitempty"`
	Module     bool              `json:"module"`
}

func (s *WorkerService) ListWorkers(accountID uint) ([]WorkerScript, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	resp, _, err := api.ListWorkers(context.Background(), rc, cloudflare.ListWorkersParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list workers: %w", err)
	}

	workers := make([]WorkerScript, 0, len(resp.WorkerList))
	for _, w := range resp.WorkerList {
		workers = append(workers, WorkerScript{
			ID:         w.ID,
			ETag:       w.ETAG,
			Size:       w.Size,
			CreatedOn:  w.CreatedOn.Format("2006-01-02T15:04:05Z"),
			ModifiedOn: w.ModifiedOn.Format("2006-01-02T15:04:05Z"),
		})
	}
	return workers, nil
}

func (s *WorkerService) GetWorkerCode(accountID uint, scriptName string) (string, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return "", err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	resp, err := api.GetWorker(context.Background(), rc, scriptName)
	if err != nil {
		return "", fmt.Errorf("failed to get worker: %w", err)
	}

	return resp.Script, nil
}

func (s *WorkerService) DeployWorker(accountID uint, req WorkerDeployRequest) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	params := cloudflare.CreateWorkerParams{
		ScriptName: req.ScriptName,
		Script:     req.Content,
	}

	if req.Module {
		params.Module = true
	}

	_, err = api.UploadWorker(context.Background(), rc, params)
	if err != nil {
		return fmt.Errorf("failed to deploy worker: %w", err)
	}
	return nil
}

func (s *WorkerService) DeleteWorker(accountID uint, scriptName string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	err = api.DeleteWorker(context.Background(), rc, cloudflare.DeleteWorkerParams{ScriptName: scriptName})
	if err != nil {
		return fmt.Errorf("failed to delete worker: %w", err)
	}
	return nil
}

func (s *WorkerService) GetWorkerContent(accountID uint, scriptName string) (string, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return "", err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	content, err := api.GetWorkersScriptContent(context.Background(), rc, scriptName)
	if err != nil {
		return "", fmt.Errorf("failed to get worker content: %w", err)
	}
	return content, nil
}
