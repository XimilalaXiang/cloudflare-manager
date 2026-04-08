package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/email_routing"
)

type EmailRoutingService struct {
	accountService *AccountService
}

func NewEmailRoutingService(accountService *AccountService) *EmailRoutingService {
	return &EmailRoutingService{accountService: accountService}
}

type EmailRoutingSettings struct {
	Enabled bool   `json:"enabled"`
	Name    string `json:"name,omitempty"`
	Tag     string `json:"tag,omitempty"`
}

type EmailRoutingRuleInfo struct {
	ID       string                    `json:"id"`
	Tag      string                    `json:"tag,omitempty"`
	Name     string                    `json:"name,omitempty"`
	Priority float64                   `json:"priority"`
	Enabled  bool                      `json:"enabled"`
	Matchers []EmailRoutingRuleMatcher `json:"matchers"`
	Actions  []EmailRoutingRuleAction  `json:"actions"`
}

type EmailRoutingRuleMatcher struct {
	Type  string `json:"type"`
	Field string `json:"field"`
	Value string `json:"value"`
}

type EmailRoutingRuleAction struct {
	Type  string   `json:"type"`
	Value []string `json:"value"`
}

type CreateEmailRuleRequest struct {
	Name     string                    `json:"name"`
	Priority float64                   `json:"priority"`
	Enabled  bool                      `json:"enabled"`
	Matchers []EmailRoutingRuleMatcher `json:"matchers" binding:"required"`
	Actions  []EmailRoutingRuleAction  `json:"actions" binding:"required"`
}

type EmailAddressInfo struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Verified string `json:"verified,omitempty"`
	Created  string `json:"created,omitempty"`
	Modified string `json:"modified,omitempty"`
}

type CreateEmailAddressRequest struct {
	Email string `json:"email" binding:"required"`
}

type CatchAllRule struct {
	Enabled  bool                     `json:"enabled"`
	Matchers []EmailRoutingRuleMatcher `json:"matchers"`
	Actions  []EmailRoutingRuleAction  `json:"actions"`
}

func (s *EmailRoutingService) GetSettings(accountID uint, zoneID string) (*EmailRoutingSettings, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	settings, err := client.EmailRouting.Get(context.Background(), email_routing.EmailRoutingGetParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get email routing settings: %w", err)
	}

	return &EmailRoutingSettings{
		Enabled: bool(settings.Enabled),
		Name:    settings.Name,
		Tag:     settings.Tag,
	}, nil
}

func (s *EmailRoutingService) Enable(accountID uint, zoneID string) (*EmailRoutingSettings, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	settings, err := client.EmailRouting.Enable(context.Background(), email_routing.EmailRoutingEnableParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to enable email routing: %w", err)
	}

	return &EmailRoutingSettings{
		Enabled: bool(settings.Enabled),
		Name:    settings.Name,
		Tag:     settings.Tag,
	}, nil
}

func (s *EmailRoutingService) Disable(accountID uint, zoneID string) (*EmailRoutingSettings, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	settings, err := client.EmailRouting.Disable(context.Background(), email_routing.EmailRoutingDisableParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to disable email routing: %w", err)
	}

	return &EmailRoutingSettings{
		Enabled: bool(settings.Enabled),
		Name:    settings.Name,
		Tag:     settings.Tag,
	}, nil
}

func (s *EmailRoutingService) ListRules(accountID uint, zoneID string) ([]EmailRoutingRuleInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	page, err := client.EmailRouting.Rules.List(context.Background(), email_routing.RuleListParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list email routing rules: %w", err)
	}

	var result []EmailRoutingRuleInfo
	for _, r := range page.Result {
		info := EmailRoutingRuleInfo{
			ID:       r.ID,
			Tag:      r.Tag,
			Name:     r.Name,
			Priority: r.Priority,
			Enabled:  bool(r.Enabled),
		}
		for _, m := range r.Matchers {
			info.Matchers = append(info.Matchers, EmailRoutingRuleMatcher{
				Type:  string(m.Type),
				Field: string(m.Field),
				Value: m.Value,
			})
		}
		for _, a := range r.Actions {
			info.Actions = append(info.Actions, EmailRoutingRuleAction{
				Type:  string(a.Type),
				Value: a.Value,
			})
		}
		result = append(result, info)
	}
	return result, nil
}

func (s *EmailRoutingService) CreateRule(accountID uint, zoneID string, req CreateEmailRuleRequest) (*EmailRoutingRuleInfo, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	matchers := make([]email_routing.MatcherParam, len(req.Matchers))
	for i, m := range req.Matchers {
		matchers[i] = email_routing.MatcherParam{
			Type:  cloudflare.F(email_routing.MatcherType(m.Type)),
			Field: cloudflare.F(email_routing.MatcherField(m.Field)),
			Value: cloudflare.F(m.Value),
		}
	}

	actions := make([]email_routing.ActionParam, len(req.Actions))
	for i, a := range req.Actions {
		actions[i] = email_routing.ActionParam{
			Type:  cloudflare.F(email_routing.ActionType(a.Type)),
			Value: cloudflare.F(a.Value),
		}
	}

	enabled := email_routing.RuleNewParamsEnabledTrue
	if !req.Enabled {
		enabled = email_routing.RuleNewParamsEnabledFalse
	}

	r, err := client.EmailRouting.Rules.New(context.Background(), email_routing.RuleNewParams{
		ZoneID:   cloudflare.F(zoneID),
		Name:     cloudflare.F(req.Name),
		Priority: cloudflare.F(req.Priority),
		Enabled:  cloudflare.F(enabled),
		Matchers: cloudflare.F(matchers),
		Actions:  cloudflare.F(actions),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create email routing rule: %w", err)
	}

	info := &EmailRoutingRuleInfo{
		ID:       r.ID,
		Tag:      r.Tag,
		Name:     r.Name,
		Priority: r.Priority,
		Enabled:  bool(r.Enabled),
	}
	for _, m := range r.Matchers {
		info.Matchers = append(info.Matchers, EmailRoutingRuleMatcher{
			Type:  string(m.Type),
			Field: string(m.Field),
			Value: m.Value,
		})
	}
	for _, a := range r.Actions {
		info.Actions = append(info.Actions, EmailRoutingRuleAction{
			Type:  string(a.Type),
			Value: a.Value,
		})
	}
	return info, nil
}

func (s *EmailRoutingService) DeleteRule(accountID uint, zoneID, ruleID string) error {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.EmailRouting.Rules.Delete(context.Background(), ruleID, email_routing.RuleDeleteParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete email routing rule: %w", err)
	}
	return nil
}

func (s *EmailRoutingService) ListAddresses(accountID uint) ([]EmailAddressInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	page, err := client.EmailRouting.Addresses.List(context.Background(), email_routing.AddressListParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list destination addresses: %w", err)
	}

	var result []EmailAddressInfo
	for _, a := range page.Result {
		info := EmailAddressInfo{
			ID:    a.ID,
			Email: a.Email,
		}
		if !a.Created.IsZero() {
			info.Created = a.Created.Format("2006-01-02T15:04:05Z")
		}
		if !a.Modified.IsZero() {
			info.Modified = a.Modified.Format("2006-01-02T15:04:05Z")
		}
		if !a.Verified.IsZero() {
			info.Verified = a.Verified.Format("2006-01-02T15:04:05Z")
		}
		result = append(result, info)
	}
	return result, nil
}

func (s *EmailRoutingService) CreateAddress(accountID uint, email string) (*EmailAddressInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	a, err := client.EmailRouting.Addresses.New(context.Background(), email_routing.AddressNewParams{
		AccountID: cloudflare.F(account.AccountID),
		Email:     cloudflare.F(email),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create destination address: %w", err)
	}

	info := &EmailAddressInfo{
		ID:    a.ID,
		Email: a.Email,
	}
	if !a.Created.IsZero() {
		info.Created = a.Created.Format("2006-01-02T15:04:05Z")
	}
	return info, nil
}

func (s *EmailRoutingService) DeleteAddress(accountID uint, addressID string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.EmailRouting.Addresses.Delete(context.Background(), addressID, email_routing.AddressDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete destination address: %w", err)
	}
	return nil
}

func (s *EmailRoutingService) GetCatchAll(accountID uint, zoneID string) (*CatchAllRule, error) {
	client, _, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	r, err := client.EmailRouting.Rules.CatchAlls.Get(context.Background(), email_routing.RuleCatchAllGetParams{
		ZoneID: cloudflare.F(zoneID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get catch-all rule: %w", err)
	}

	info := &CatchAllRule{
		Enabled: bool(r.Enabled),
	}
	for _, m := range r.Matchers {
		info.Matchers = append(info.Matchers, EmailRoutingRuleMatcher{
			Type: string(m.Type),
		})
	}
	for _, a := range r.Actions {
		info.Actions = append(info.Actions, EmailRoutingRuleAction{
			Type:  string(a.Type),
			Value: a.Value,
		})
	}
	return info, nil
}
