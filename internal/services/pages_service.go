package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/pages"
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.Pages.Projects.ListAutoPaging(context.Background(), pages.ProjectListParams{
		AccountID: cloudflare.F(account.AccountID),
	})

	var result []PagesProjectInfo
	for iter.Next() {
		p := iter.Current()
		info := PagesProjectInfo{
			Name:             p.Name,
			ID:               p.ID,
			SubDomain:        p.Subdomain,
			Domains:          p.Domains,
			ProductionBranch: p.ProductionBranch,
		}
		if !p.CreatedOn.IsZero() {
			info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list pages projects: %w", err)
	}
	return result, nil
}

func (s *PagesService) GetProject(accountID uint, projectName string) (*PagesProjectInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	p, err := client.Pages.Projects.Get(context.Background(), projectName, pages.ProjectGetParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get pages project: %w", err)
	}

	info := &PagesProjectInfo{
		Name:             p.Name,
		ID:               p.ID,
		SubDomain:        p.Subdomain,
		Domains:          p.Domains,
		ProductionBranch: p.ProductionBranch,
	}
	if !p.CreatedOn.IsZero() {
		info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
	}
	return info, nil
}

func (s *PagesService) CreateProject(accountID uint, req CreatePagesProjectRequest) (*PagesProjectInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	branch := req.ProductionBranch
	if branch == "" {
		branch = "main"
	}

	p, err := client.Pages.Projects.New(context.Background(), pages.ProjectNewParams{
		AccountID:        cloudflare.F(account.AccountID),
		Name:             cloudflare.F(req.Name),
		ProductionBranch: cloudflare.F(branch),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create pages project: %w", err)
	}

	info := &PagesProjectInfo{
		Name:             p.Name,
		ID:               p.ID,
		SubDomain:        p.Subdomain,
		Domains:          p.Domains,
		ProductionBranch: p.ProductionBranch,
	}
	if !p.CreatedOn.IsZero() {
		info.CreatedOn = p.CreatedOn.Format("2006-01-02T15:04:05Z")
	}
	return info, nil
}

func (s *PagesService) DeleteProject(accountID uint, projectName string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.Pages.Projects.Delete(context.Background(), projectName, pages.ProjectDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete pages project: %w", err)
	}
	return nil
}

func (s *PagesService) ListDeployments(accountID uint, projectName string) ([]PagesDeploymentInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.Pages.Projects.Deployments.ListAutoPaging(context.Background(), projectName, pages.ProjectDeploymentListParams{
		AccountID: cloudflare.F(account.AccountID),
	})

	var result []PagesDeploymentInfo
	for iter.Next() {
		d := iter.Current()
		info := PagesDeploymentInfo{
			ID:          d.ID,
			ShortID:     d.ShortID,
			ProjectName: d.ProjectName,
			Environment: string(d.Environment),
			URL:         d.URL,
			LatestStage: string(d.LatestStage.Name) + ": " + string(d.LatestStage.Status),
		}
		if !d.CreatedOn.IsZero() {
			info.CreatedOn = d.CreatedOn.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}
	return result, nil
}

func (s *PagesService) DeleteDeployment(accountID uint, projectName, deploymentID string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.Pages.Projects.Deployments.Delete(context.Background(), projectName, deploymentID, pages.ProjectDeploymentDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete deployment: %w", err)
	}
	return nil
}
