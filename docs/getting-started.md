---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

## Prerequisites

- Docker and Docker Compose (recommended), or
- Go 1.25+ with CGO support (for SQLite)

## Installation

### Docker (Recommended)

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=8080
JWT_SECRET=your-secure-random-secret-here
ENCRYPTION_KEY=your-32-byte-encryption-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

> **Important:** Change `JWT_SECRET` and `ENCRYPTION_KEY` to strong random values in production. The encryption key must be at least 32 characters for AES-256.

Start the service:

```bash
docker compose up -d
```

### Manual Build

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
go build -o server ./cmd/server
./server
```

## Configuration

All configuration is done through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server listen port |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite database file path |
| `JWT_SECRET` | `change-me-in-production` | Secret key for JWT token signing |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | 32-byte key for AES-256-GCM encryption |
| `ADMIN_USERNAME` | `admin` | Initial admin account username |
| `ADMIN_PASSWORD` | `admin` | Initial admin account password |

## First Steps

### 1. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {"id": 1, "username": "admin"}
}
```

Save the `token` value — you'll need it for all subsequent requests.

### 2. Change Default Password

```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"old_password": "admin", "new_password": "your-new-secure-password"}'
```

### 3. Add a Cloudflare Account

```bash
curl -X POST http://localhost:8080/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Main Account",
    "email": "you@example.com",
    "account_id": "your-cloudflare-account-id",
    "api_token": "your-cloudflare-api-token"
  }'
```

The API token is verified against Cloudflare before being stored. It's encrypted with AES-256-GCM and never returned in API responses.

### 4. List Your Zones

```bash
curl http://localhost:8080/api/cf/1/zones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Replace `1` with your account's database ID (returned when you created it).

## Getting a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit zone DNS** template, or create a custom token with the permissions you need
4. Copy the generated token

> **Tip:** Create tokens with the minimum required permissions for your use case.

## Running Tests

```bash
go test ./... -v
```
