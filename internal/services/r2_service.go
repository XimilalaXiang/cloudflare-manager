package services

import (
	"context"
	"fmt"

	"github.com/cloudflare/cloudflare-go"
)

type R2Service struct {
	accountService *AccountService
}

func NewR2Service(accountService *AccountService) *R2Service {
	return &R2Service{accountService: accountService}
}

type R2BucketInfo struct {
	Name         string `json:"name"`
	CreationDate string `json:"creation_date,omitempty"`
	Location     string `json:"location,omitempty"`
}

func (s *R2Service) ListBuckets(accountID uint) ([]R2BucketInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	resp, err := api.ListR2Buckets(context.Background(), rc, cloudflare.ListR2BucketsParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to list R2 buckets: %w", err)
	}

	buckets := make([]R2BucketInfo, 0, len(resp))
	for _, b := range resp {
		buckets = append(buckets, R2BucketInfo{
			Name:     b.Name,
			Location: b.Location,
		})
	}
	return buckets, nil
}

type CreateR2BucketRequest struct {
	Name     string `json:"name" binding:"required"`
	Location string `json:"location"`
}

func (s *R2Service) CreateBucket(accountID uint, name, location string) (*R2BucketInfo, error) {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	params := cloudflare.CreateR2BucketParameters{
		Name: name,
	}
	if location != "" {
		params.LocationHint = location
	}

	bucket, err := api.CreateR2Bucket(context.Background(), rc, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create R2 bucket: %w", err)
	}

	return &R2BucketInfo{
		Name:     bucket.Name,
		Location: bucket.Location,
	}, nil
}

func (s *R2Service) DeleteBucket(accountID uint, bucketName string) error {
	api, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	rc := cloudflare.AccountIdentifier(account.AccountID)
	err = api.DeleteR2Bucket(context.Background(), rc, bucketName)
	if err != nil {
		return fmt.Errorf("failed to delete R2 bucket: %w", err)
	}
	return nil
}
