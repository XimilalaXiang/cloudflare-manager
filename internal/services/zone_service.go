package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/dns"
	"github.com/cloudflare/cloudflare-go/v6/zones"
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
	ID       string  `json:"id"`
	Type     string  `json:"type"`
	Name     string  `json:"name"`
	Content  string  `json:"content"`
	TTL      int     `json:"ttl"`
	Proxied  *bool   `json:"proxied"`
	Priority *uint16 `json:"priority,omitempty"`
}

func (s *ZoneService) ListZones(accountID uint) ([]ZoneInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.Zones.ListAutoPaging(context.Background(), zones.ZoneListParams{
		Account: cloudflare.F(zones.ZoneListParamsAccount{
			ID: cloudflare.F(account.AccountID),
		}),
	})

	var result []ZoneInfo
	for iter.Next() {
		z := iter.Current()
		result = append(result, ZoneInfo{
			ID:                z.ID,
			Name:              z.Name,
			Status:            string(z.Status),
			Paused:            z.Paused,
			NameServers:       z.NameServers,
			OriginalNS:        z.OriginalNameServers,
			OriginalRegistrar: z.OriginalRegistrar,
		})
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list zones: %w", err)
	}
	return result, nil
}

func (s *ZoneService) GetZone(accountID uint, zoneID string) (*ZoneInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	z, err := client.Zones.Get(context.Background(), zones.ZoneGetParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get zone: %w", err)
	}

	return &ZoneInfo{
		ID:                z.ID,
		Name:              z.Name,
		Status:            string(z.Status),
		Paused:            z.Paused,
		NameServers:       z.NameServers,
		OriginalNS:        z.OriginalNameServers,
		OriginalRegistrar: z.OriginalRegistrar,
	}, nil
}

func (s *ZoneService) ListDNSRecords(accountID uint, zoneID string) ([]DNSRecordInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	iter := client.DNS.Records.ListAutoPaging(context.Background(), dns.RecordListParams{
		ZoneID: cloudflare.F(zoneID),
	})

	var result []DNSRecordInfo
	for iter.Next() {
		r := iter.Current()
		ttl := 0
		if r.TTL != 0 {
			ttl = int(r.TTL)
		}
		info := DNSRecordInfo{
			ID:      r.ID,
			Type:    string(r.Type),
			Name:    r.Name,
			Content: r.Content,
			TTL:     ttl,
			Proxied: &r.Proxied,
		}
		result = append(result, info)
	}
	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("failed to list DNS records: %w", err)
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
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	body := dns.RecordNewParamsBody{
		Name:    cloudflare.F(req.Name),
		Type:    cloudflare.F(dns.RecordNewParamsBodyType(req.Type)),
		Content: cloudflare.F(req.Content),
		TTL:     cloudflare.F(dns.TTL(req.TTL)),
	}
	if req.Proxied != nil {
		body.Proxied = cloudflare.F(*req.Proxied)
	}
	if req.Priority != nil {
		body.Priority = cloudflare.F(float64(*req.Priority))
	}

	record, err := client.DNS.Records.New(context.Background(), dns.RecordNewParams{
		ZoneID: cloudflare.F(zoneID),
		Body:   body,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create DNS record: %w", err)
	}

	proxied := record.Proxied
	return &DNSRecordInfo{
		ID:      record.ID,
		Type:    string(record.Type),
		Name:    record.Name,
		Content: record.Content,
		TTL:     int(record.TTL),
		Proxied: &proxied,
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
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	body := dns.RecordUpdateParamsBody{
		Name:    cloudflare.F(req.Name),
		Type:    cloudflare.F(dns.RecordUpdateParamsBodyType(req.Type)),
		Content: cloudflare.F(req.Content),
		TTL:     cloudflare.F(dns.TTL(req.TTL)),
	}
	if req.Proxied != nil {
		body.Proxied = cloudflare.F(*req.Proxied)
	}

	record, err := client.DNS.Records.Update(context.Background(), recordID, dns.RecordUpdateParams{
		ZoneID: cloudflare.F(zoneID),
		Body:   body,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update DNS record: %w", err)
	}

	proxied := record.Proxied
	return &DNSRecordInfo{
		ID:      record.ID,
		Type:    string(record.Type),
		Name:    record.Name,
		Content: record.Content,
		TTL:     int(record.TTL),
		Proxied: &proxied,
	}, nil
}

func (s *ZoneService) DeleteDNSRecord(accountID uint, zoneID, recordID string) error {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.DNS.Records.Delete(context.Background(), recordID, dns.RecordDeleteParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete DNS record: %w", err)
	}
	return nil
}
