# Architecture

## Project Structure

```
cloudflare-manager/
├── cmd/server/main.go        # Entry point
├── internal/
│   ├── config/               # Environment variable loading
│   ├── database/             # SQLite/GORM init
│   ├── handlers/             # HTTP handlers + router
│   ├── middleware/            # JWT auth + CORS
│   ├── models/               # GORM models
│   └── services/             # Business logic + CF API
├── pkg/crypto/               # AES-256-GCM encryption
├── web/                      # React frontend (Vite + Tailwind)
├── docs/                     # VitePress documentation
├── Dockerfile
└── docker-compose.yml
```

## Three-Layer Architecture

```
HTTP Request → Handlers → Services → Database + Cloudflare API
```

- **Handlers** — Parse HTTP, validate input, return responses
- **Services** — Business logic, Cloudflare API calls via `cloudflare-go`
- **Database** — GORM + SQLite persistence, AES-256-GCM for sensitive data

## Security Design

### Token Encryption

```
User provides API token
        ↓
Token verified against CF API
        ↓
Encrypted with AES-256-GCM
        ↓
Stored as base64 in SQLite
```

### Authentication Flow

```
POST /api/auth/login
        ↓
Verify username + bcrypt password
        ↓
Generate JWT (24h expiry)
        ↓
Client stores token → sends in Authorization header
        ↓
AuthRequired middleware validates + injects user context
```

## Database Schema

### accounts

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER (PK) | Auto-increment |
| name | TEXT | Display name |
| email | TEXT | Associated email |
| account_id | TEXT (UNIQUE) | Cloudflare account ID |
| api_token | TEXT | AES-256-GCM encrypted |
| status | TEXT | active / inactive / unknown |

### users

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER (PK) | Auto-increment |
| username | TEXT (UNIQUE) | |
| password | TEXT | bcrypt hash |
