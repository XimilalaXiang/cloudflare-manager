package services

import (
	"context"
	"fmt"

	cloudflare "github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/r2"
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
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	resp, err := client.R2.Buckets.List(context.Background(), r2.BucketListParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list R2 buckets: %w", err)
	}

	var buckets []R2BucketInfo
	for _, b := range resp.Buckets {
		buckets = append(buckets, R2BucketInfo{
			Name:         b.Name,
			CreationDate: b.CreationDate,
			Location:     string(b.Location),
		})
	}
	return buckets, nil
}

type CreateR2BucketRequest struct {
	Name     string `json:"name" binding:"required"`
	Location string `json:"location"`
}

func (s *R2Service) CreateBucket(accountID uint, name, location string) (*R2BucketInfo, error) {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return nil, err
	}

	params := r2.BucketNewParams{
		AccountID: cloudflare.F(account.AccountID),
		Name:      cloudflare.F(name),
	}
	if location != "" {
		params.LocationHint = cloudflare.F(r2.BucketNewParamsLocationHint(location))
	}

	bucket, err := client.R2.Buckets.New(context.Background(), params)
	if err != nil {
		return nil, fmt.Errorf("failed to create R2 bucket: %w", err)
	}

	return &R2BucketInfo{
		Name:     bucket.Name,
		Location: string(bucket.Location),
	}, nil
}

func (s *R2Service) DeleteBucket(accountID uint, bucketName string) error {
	client, account, err := s.accountService.GetCFClient(accountID)
	if err != nil {
		return err
	}

	_, err = client.R2.Buckets.Delete(context.Background(), bucketName, r2.BucketDeleteParams{
		AccountID: cloudflare.F(account.AccountID),
	})
	if err != nil {
		return fmt.Errorf("failed to delete R2 bucket: %w", err)
	}
	return nil
}
