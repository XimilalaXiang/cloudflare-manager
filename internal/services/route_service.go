package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
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
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	resp, err := api.ListWorkerRoutes(context.Background(), rc, cloudflare.ListWorkerRoutesParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list worker routes: %w", err)
	}

	routes := make([]WorkerRouteInfo, 0, len(resp.Routes))
	for _, r := range resp.Routes {
		routes = append(routes, WorkerRouteInfo{
			ID:      r.ID,
			Pattern: r.Pattern,
			Script:  r.ScriptName,
		})
	}
	return routes, nil
}

type CreateRouteRequest struct {
	Pattern string `json:"pattern" binding:"required"`
	Script  string `json:"script" binding:"required"`
}

func (s *RouteService) CreateRoute(accountID uint, zoneID string, req CreateRouteRequest) (*WorkerRouteInfo, error) {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	resp, err := api.CreateWorkerRoute(context.Background(), rc, cloudflare.CreateWorkerRouteParams{
		Pattern: req.Pattern,
		Script:  req.Script,
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
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	_, err = api.DeleteWorkerRoute(context.Background(), rc, routeID)
	if err != nil {
		return fmt.Errorf("failed to delete worker route: %w", err)
	}
	return nil
}
