---
layout: default
title: Architecture
nav_order: 4
---

# Architecture

## Project Structure

```
cloudflare-manager/
├── cmd/
│   └── server/
│       └── main.go          # Entry point, DI wiring
├── internal/
│   ├── config/
│   │   └── config.go        # Environment variable loading
│   ├── database/
│   │   └── database.go      # SQLite/GORM initialization
│   ├── handlers/
│   │   ├── router.go        # Route definitions
│   │   ├── auth_handler.go  # Login, change password, me
│   │   ├── account_handler.go
│   │   ├── worker_handler.go
│   │   ├── zone_handler.go
│   │   ├── kv_handler.go
│   │   ├── d1_handler.go
│   │   ├── r2_handler.go
│   │   └── route_handler.go
│   ├── middleware/
│   │   ├── auth.go          # JWT generation & validation
│   │   └── cors.go          # CORS headers
│   ├── models/
│   │   └── models.go        # GORM models (Account, User, AuditLog)
│   └── services/
│       ├── account_service.go  # Account CRUD + CF client factory
│       ├── worker_service.go
│       ├── zone_service.go
│       ├── kv_service.go
│       ├── d1_service.go
│       ├── r2_service.go
│       └── route_service.go
├── pkg/
│   └── crypto/
│       └── crypto.go        # AES-256-GCM encrypt/decrypt
├── docs/                     # GitHub Pages documentation
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── go.sum
```

## Layered Architecture

The project follows a clean three-layer architecture:

```
HTTP Request
     │
     ▼
┌─────────────┐
│  Handlers   │  Parse HTTP requests, validate input, format responses
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services   │  Business logic, Cloudflare API calls
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  GORM + SQLite persistence
│  + Crypto   │  AES-256-GCM encryption for sensitive data
└─────────────┘
```

### Handlers (internal/handlers/)

Handlers are responsible for:
- Parsing and validating HTTP request parameters
- Calling the appropriate service method
- Formatting and returning HTTP responses with correct status codes

Each handler receives its service dependency via constructor injection.

### Services (internal/services/)

Services contain the business logic:
- `AccountService` manages Cloudflare account records and creates authenticated Cloudflare API clients
- All other services depend on `AccountService` to obtain a configured `cloudflare-go` API client
- Services never touch HTTP directly

### Models (internal/models/)

GORM models define the database schema:
- `Account` — Cloudflare account with encrypted API token
- `User` — Admin users with bcrypt-hashed passwords
- `AuditLog` — Operation audit trail

## Security Design

### Token Encryption

```
User provides API token
        │
        ▼
  Token verified against CF API
        │
        ▼
  Encrypted with AES-256-GCM
        │
        ▼
  Stored as base64 in SQLite
```

- API tokens are **never** stored in plaintext
- The `APIToken` field uses `json:"-"` to prevent serialization
- A masked version (`cfut****5bc3`) is computed on read for display

### Authentication Flow

```
POST /api/auth/login
        │
        ▼
  Verify username + bcrypt password
        │
        ▼
  Generate JWT (24h expiry)
        │
        ▼
  Client stores token
        │
        ▼
  Subsequent requests include:
  Authorization: Bearer <jwt>
        │
        ▼
  AuthRequired middleware validates
  and injects user_id, username
```

## Dependency Graph

```
main.go
  ├── config.Load()
  ├── database.Init()
  ├── middleware.SetJWTSecret()
  ├── AccountService(encryptionKey)
  │     └── crypto.Encrypt/Decrypt
  ├── WorkerService(AccountService)
  ├── ZoneService(AccountService)
  ├── RouteService(AccountService)
  ├── KVService(AccountService)
  ├── D1Service(AccountService)
  ├── R2Service(AccountService)
  └── SetupRouter(all services)
```

All Cloudflare-facing services depend on `AccountService` for:
1. Looking up the account record
2. Decrypting the API token
3. Creating an authenticated `cloudflare-go` client

## Database Schema

### accounts

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER (PK) | Auto-increment |
| name | TEXT | Account display name |
| email | TEXT | Associated email |
| account_id | TEXT (UNIQUE) | Cloudflare account ID |
| api_token | TEXT | AES-256-GCM encrypted |
| status | TEXT | active, inactive, unknown |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | Soft delete |

### users

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER (PK) | Auto-increment |
| username | TEXT (UNIQUE) | |
| password | TEXT | bcrypt hash |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### audit_logs

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER (PK) | Auto-increment |
| user_id | INTEGER | |
| account_id | INTEGER | |
| action | TEXT | |
| resource | TEXT | |
| detail | TEXT | |
| created_at | DATETIME | |
