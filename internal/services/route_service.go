package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/workers"
)

type RouteService struct {
	accountService *AccountService
}

func NewRouteService(accountService *AccountService) *RouteService {
	return &RouteService{accountService: accountService}
}

type WorkerRouteInfo struct {
	ID      string `json:"id"`
	Pattern string `json:"pattern"`
	Script  string `json:"script"`
}

func (s *RouteService) ListRoutes(accountID uint, zoneID string) ([]WorkerRouteInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	page, err := client.Workers.Routes.List(context.Background(), workers.RouteListParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list worker routes: %w", err)
	}

	var routes []WorkerRouteInfo
	for _, r := range page.Result {
		routes = append(routes, WorkerRouteInfo{
			ID:      r.ID,
			Pattern: r.Pattern,
			Script:  r.Script,
		})
	}
	return routes, nil
}

type CreateRouteRequest struct {
	Pattern string `json:"pattern" binding:"required"`
	Script  string `json:"script" binding:"required"`
}

func (s *RouteService) CreateRoute(accountID uint, zoneID string, req CreateRouteRequest) (*WorkerRouteInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	resp, err := client.Workers.Routes.New(context.Background(), workers.RouteNewParams{
		ZoneID:  cloudflare.F(zoneID),
		Pattern: cloudflare.F(req.Pattern),
		Script:  cloudflare.F(req.Script),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create worker route: %w", err)
	}

	return &WorkerRouteInfo{
		ID:      resp.ID,
		Pattern: req.Pattern,
		Script:  req.Script,
	}, nil
}

func (s *RouteService) DeleteRoute(accountID uint, zoneID, routeID string) error {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.Workers.Routes.Delete(context.Background(), routeID, workers.RouteDeleteParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete worker route: %w", err)
	}
	return nil
}
