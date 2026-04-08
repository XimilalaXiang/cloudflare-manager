package services

import (
	"context"
	"fmt"
	"io"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/workers"
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

type WorkerVersionInfo struct {
	ID          string `json:"id"`
	Number      float64 `json:"number"`
	CreatedOn   string `json:"created_on,omitempty"`
	ModifiedOn  string `json:"modified_on,omitempty"`
	AuthorEmail string `json:"author_email,omitempty"`
	Source      string `json:"source,omitempty"`
}

type WorkerDeploymentInfo struct {
	ID          string                     `json:"id"`
	Source      string                     `json:"source"`
	Strategy    string                     `json:"strategy"`
	AuthorEmail string                     `json:"author_email,omitempty"`
	CreatedOn   string                     `json:"created_on,omitempty"`
	Versions    []WorkerDeploymentVersion  `json:"versions"`
	Message     string                     `json:"message,omitempty"`
}

type WorkerDeploymentVersion struct {
	VersionID  string  `json:"version_id"`
	Percentage float64 `json:"percentage"`
}

func (s *WorkerService) ListWorkers(accountID uint) ([]WorkerScript, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	page, err := client.Workers.Scripts.List(context.Background(), workers.ScriptListParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list workers: %w", err)
	}

	result := make([]WorkerScript, 0, len(page.Result))
	for _, w := range page.Result {
		result = append(result, WorkerScript{
			ID:         w.ID,
			ETag:       w.Etag,
			CreatedOn:  w.CreatedOn.Format("2006-01-02T15:04:05Z"),
			ModifiedOn: w.ModifiedOn.Format("2006-01-02T15:04:05Z"),
		})
	}
	return result, nil
}

func (s *WorkerService) GetWorkerCode(accountID uint, scriptName string) (string, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return "", err
	}

	resp, err := client.Workers.Scripts.Content.Get(context.Background(), scriptName, workers.ScriptContentGetParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return "", fmt.Errorf("failed to get worker content: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read worker content: %w", err)
	}
	return string(body), nil
}

func (s *WorkerService) DeployWorker(accountID uint, req WorkerDeployRequest) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	mainModule := "worker.js"
	if req.Module {
		mainModule = "worker.mjs"
	}

	_, err = client.Workers.Scripts.Update(context.Background(), req.ScriptName, workers.ScriptUpdateParams{
		AccountID: cloudflare.F(account.AccountID),
		Metadata: cloudflare.F(workers.ScriptUpdateParamsMetadata{
			MainModule: cloudflare.F(mainModule),
		}),
	})
	if err != nil {
		return fmt.Errorf("failed to deploy worker: %w", err)
	}
	return nil
}

func (s *WorkerService) DeleteWorker(accountID uint, scriptName string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.Workers.Scripts.Delete(context.Background(), scriptName, workers.ScriptDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete worker: %w", err)
	}
	return nil
}

func (s *WorkerService) GetWorkerContent(accountID uint, scriptName string) (string, error) {
	return s.GetWorkerCode(accountID, scriptName)
}

func (s *WorkerService) ListVersions(accountID uint, scriptName string) ([]WorkerVersionInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.Workers.Scripts.Versions.ListAutoPaging(context.Background(), scriptName, workers.ScriptVersionListParams{
		AccountID: cloudflare.F(account.AccountID),
	})

	var result []WorkerVersionInfo
	for iter.Next() {
		v := iter.Current()
		info := WorkerVersionInfo{
			ID:     v.ID,
			Number: v.Number,
		}
		if v.Metadata.CreatedOn != "" {
			info.CreatedOn = v.Metadata.CreatedOn
		}
		if v.Metadata.ModifiedOn != "" {
			info.ModifiedOn = v.Metadata.ModifiedOn
		}
		if v.Metadata.AuthorEmail != "" {
			info.AuthorEmail = v.Metadata.AuthorEmail
		}
		if v.Metadata.Source != "" {
			info.Source = string(v.Metadata.Source)
		}
		result = append(result, info)
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list worker versions: %w", err)
	}
	return result, nil
}

func (s *WorkerService) GetDeployments(accountID uint, scriptName string) (*WorkerDeploymentInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	resp, err := client.Workers.Scripts.Deployments.List(context.Background(), scriptName, workers.ScriptDeploymentListParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get deployments: %w", err)
	}

	if len(resp.Deployments) == 0 {
		return nil, nil
	}

	d := resp.Deployments[0]
	info := &WorkerDeploymentInfo{
		ID:          d.ID,
		Source:      d.Source,
		Strategy:    string(d.Strategy),
		AuthorEmail: d.AuthorEmail,
		CreatedOn:   d.CreatedOn.Format("2006-01-02T15:04:05Z"),
	}
	if d.Annotations.WorkersMessage != "" {
		info.Message = d.Annotations.WorkersMessage
	}
	for _, v := range d.Versions {
		info.Versions = append(info.Versions, WorkerDeploymentVersion{
			VersionID:  v.VersionID,
			Percentage: v.Percentage,
		})
	}
	return info, nil
}

