package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type PagesService struct {
	accountService *AccountService
}

func NewPagesService(accountService *AccountService) *PagesService {
	return &PagesService{accountService: accountService}
}

type PagesProjectInfo struct {
	Name             string   `json:"name"`
	ID               string   `json:"id"`
	SubDomain        string   `json:"subdomain"`
	Domains          []string `json:"domains"`
	ProductionBranch string   `json:"production_branch"`
	CreatedOn        string   `json:"created_on,omitempty"`
}

type PagesDeploymentInfo struct {
	ID          string `json:"id"`
	ShortID     string `json:"short_id"`
	ProjectName string `json:"project_name"`
	Environment string `json:"environment"`
	URL         string `json:"url"`
	LatestStage string `json:"latest_stage"`
	CreatedOn   string `json:"created_on,omitempty"`
}

type CreatePagesProjectRequest struct {
	Name             string `json:"name" binding:"required"`
	ProductionBranch string `json:"production_branch"`
}

func (s *PagesService) ListProjects(accountID uint) ([]PagesProjectInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	projects, _, err := api.ListPagesProjects(context.Background(), rc, cloudflare.ListPagesProjectsParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pages projects: %w", err)
	}

	result := make([]PagesProjectInfo, 0, len(projects))
	for _, p := range projects {
		info := PagesProjectInfo{
			Name:             p.Name,
			ID:               p.ID,
			SubDomain:        p.SubDomain,
			Domains:          p.Domains,
			ProductionBranch: p.ProductionBranch,
		}
		if p.CreatedOn != nil {
			info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	return result, nil
}

func (s *PagesService) GetProject(accountID uint, projectName string) (*PagesProjectInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	p, err := api.GetPagesProject(context.Background(), rc, projectName)
	if err != nil {
		return nil, fmt.Errorf("failed to get pages project: %w", err)
	}

	info := &PagesProjectInfo{
		Name:             p.Name,
		ID:               p.ID,
		SubDomain:        p.SubDomain,
		Domains:          p.Domains,
		ProductionBranch: p.ProductionBranch,
	}
	if p.CreatedOn != nil {
		info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
	}
	return info, nil
}

func (s *PagesService) CreateProject(accountID uint, req CreatePagesProjectRequest) (*PagesProjectInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	params := cloudflare.CreatePagesProjectParams{
		Name:             req.Name,
		ProductionBranch: req.ProductionBranch,
	}

	p, err := api.CreatePagesProject(context.Background(), rc, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create pages project: %w", err)
	}

	info := &PagesProjectInfo{
		Name:             p.Name,
		ID:               p.ID,
		SubDomain:        p.SubDomain,
		Domains:          p.Domains,
		ProductionBranch: p.ProductionBranch,
	}
	if p.CreatedOn != nil {
		info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
	}
	return info, nil
}

func (s *PagesService) DeleteProject(accountID uint, projectName string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	err = api.DeletePagesProject(context.Background(), rc, projectName)
	if err != nil {
		return fmt.Errorf("failed to delete pages project: %w", err)
	}
	return nil
}

func (s *PagesService) ListDeployments(accountID uint, projectName string) ([]PagesDeploymentInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	deployments, _, err := api.ListPagesDeployments(context.Background(), rc, cloudflare.ListPagesDeploymentsParams{
		ProjectName: projectName,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}

	result := make([]PagesDeploymentInfo, 0, len(deployments))
	for _, d := range deployments {
		info := PagesDeploymentInfo{
			ID:          d.ID,
			ShortID:     d.ShortID,
			ProjectName: d.ProjectName,
			Environment: d.Environment,
			URL:         d.URL,
			LatestStage: d.LatestStage.Name + ": " + d.LatestStage.Status,
		}
		if d.CreatedOn != nil {
			info.CreatedOn = d.CreatedOn.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	return result, nil
}

func (s *PagesService) DeleteDeployment(accountID uint, projectName, deploymentID string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	err = api.DeletePagesDeployment(context.Background(), rc, cloudflare.DeletePagesDeploymentParams{
		ProjectName:  projectName,
		DeploymentID: deploymentID,
		Force:        true,
	})
	if err != nil {
		return fmt.Errorf("failed to delete deployment: %w", err)
	}
	return nil
}
