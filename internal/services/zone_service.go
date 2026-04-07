package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type ZoneService struct {
	accountService *AccountService
}

func NewZoneService(accountService *AccountService) *ZoneService {
	return &ZoneService{accountService: accountService}
}

type ZoneInfo struct {
	ID                string   `json:"id"`
	Name              string   `json:"name"`
	Status            string   `json:"status"`
	Paused            bool     `json:"paused"`
	NameServers       []string `json:"name_servers"`
	OriginalNS        []string `json:"original_name_servers"`
	OriginalRegistrar string   `json:"original_registrar"`
}

type DNSRecordInfo struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Name     string `json:"name"`
	Content  string `json:"content"`
	TTL      int    `json:"ttl"`
	Proxied  *bool  `json:"proxied"`
	Priority *uint16 `json:"priority,omitempty"`
}

func (s *ZoneService) ListZones(accountID uint) ([]ZoneInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	zones, err := api.ListZonesContext(context.Background(), cloudflare.WithZoneFilters("", account.AccountID, ""))
	if err != nil {
		return nil, fmt.Errorf("failed to list zones: %w", err)
	}

	result := make([]ZoneInfo, 0, len(zones.Result))
	for _, z := range zones.Result {
		result = append(result, ZoneInfo{
			ID:                z.ID,
			Name:              z.Name,
			Status:            z.Status,
			Paused:            z.Paused,
			NameServers:       z.NameServers,
			OriginalNS:        z.OriginalNS,
			OriginalRegistrar: z.OriginalRegistrar,
		})
	}
	return result, nil
}

func (s *ZoneService) GetZone(accountID uint, zoneID string) (*ZoneInfo, error) {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	z, err := api.ZoneDetails(context.Background(), zoneID)
	if err != nil {
		return nil, fmt.Errorf("failed to get zone: %w", err)
	}

	return &ZoneInfo{
		ID:                z.ID,
		Name:              z.Name,
		Status:            z.Status,
		Paused:            z.Paused,
		NameServers:       z.NameServers,
		OriginalNS:        z.OriginalNS,
		OriginalRegistrar: z.OriginalRegistrar,
	}, nil
}

func (s *ZoneService) ListDNSRecords(accountID uint, zoneID string) ([]DNSRecordInfo, error) {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	records, _, err := api.ListDNSRecords(context.Background(), rc, cloudflare.ListDNSRecordsParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list DNS records: %w", err)
	}

	result := make([]DNSRecordInfo, 0, len(records))
	for _, r := range records {
		result = append(result, DNSRecordInfo{
			ID:       r.ID,
			Type:     r.Type,
			Name:     r.Name,
			Content:  r.Content,
			TTL:      r.TTL,
			Proxied:  r.Proxied,
			Priority: r.Priority,
		})
	}
	return result, nil
}

type CreateDNSRecordRequest struct {
	Type     string  `json:"type" binding:"required"`
	Name     string  `json:"name" binding:"required"`
	Content  string  `json:"content" binding:"required"`
	TTL      int     `json:"ttl"`
	Proxied  *bool   `json:"proxied"`
	Priority *uint16 `json:"priority"`
}

func (s *ZoneService) CreateDNSRecord(accountID uint, zoneID string, req CreateDNSRecordRequest) (*DNSRecordInfo, error) {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	params := cloudflare.CreateDNSRecordParams{
		Type:    req.Type,
		Name:    req.Name,
		Content: req.Content,
		TTL:     req.TTL,
		Proxied: req.Proxied,
	}
	if req.Priority != nil {
		params.Priority = req.Priority
	}

	record, err := api.CreateDNSRecord(context.Background(), rc, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create DNS record: %w", err)
	}

	return &DNSRecordInfo{
		ID:       record.ID,
		Type:     record.Type,
		Name:     record.Name,
		Content:  record.Content,
		TTL:      record.TTL,
		Proxied:  record.Proxied,
		Priority: record.Priority,
	}, nil
}

type UpdateDNSRecordRequest struct {
	Type    string `json:"type" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Content string `json:"content" binding:"required"`
	TTL     int    `json:"ttl"`
	Proxied *bool  `json:"proxied"`
}

func (s *ZoneService) UpdateDNSRecord(accountID uint, zoneID, recordID string, req UpdateDNSRecordRequest) (*DNSRecordInfo, error) {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	params := cloudflare.UpdateDNSRecordParams{
		ID:      recordID,
		Type:    req.Type,
		Name:    req.Name,
		Content: req.Content,
		TTL:     req.TTL,
		Proxied: req.Proxied,
	}

	record, err := api.UpdateDNSRecord(context.Background(), rc, params)
	if err != nil {
		return nil, fmt.Errorf("failed to update DNS record: %w", err)
	}

	return &DNSRecordInfo{
		ID:      record.ID,
		Type:    record.Type,
		Name:    record.Name,
		Content: record.Content,
		TTL:     record.TTL,
		Proxied: record.Proxied,
	}, nil
}

func (s *ZoneService) DeleteDNSRecord(accountID uint, zoneID, recordID string) error {
	api, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.ZoneIdentifier(zoneID)
	err = api.DeleteDNSRecord(context.Background(), rc, recordID)
	if err != nil {
		return fmt.Errorf("failed to delete DNS record: %w", err)
	}
	return nil
}
