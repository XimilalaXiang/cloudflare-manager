# Cloudflare Manager

A self-hosted multi-account Cloudflare management platform with a REST API backend.

## Features

### Phase 1 — Core Management
- **Account Management** — CRUD Cloudflare accounts with encrypted API token storage (AES-256-GCM)
- **Workers Management** — List, deploy, update, and delete Workers scripts
- **Zone/DNS Management** — List zones, manage DNS records (A, AAAA, CNAME, MX, TXT, etc.)
- **Worker Routes** — Create and manage Worker routes per zone

### Phase 2 — Storage
- **KV Storage** — Manage namespaces, list keys, get/put/delete values
- **D1 Databases** — Create, delete, and query D1 databases
- **R2 Buckets** — Create, list, and delete R2 storage buckets

### Security
- JWT authentication
- AES-256-GCM encrypted token storage
- CORS support
- Audit logging

## Quick Start

### Docker (Recommended)

```bash
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

### Manual

```bash
go build -o server ./cmd/server
./server
```

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/auth/change-password` | Change password |

### Account Management
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Add account |
| GET | `/api/accounts/:id` | Get account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |
| POST | `/api/accounts/:id/verify` | Verify token |

### Workers (`:accountId` = local DB account ID)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/workers` | List workers |
| POST | `/api/cf/:accountId/workers` | Deploy worker |
| GET | `/api/cf/:accountId/workers/:scriptName` | Get worker code |
| DELETE | `/api/cf/:accountId/workers/:scriptName` | Delete worker |

### Zones & DNS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/zones` | List zones |
| GET | `/api/cf/:accountId/zones/:zoneId` | Zone details |
| GET | `/api/cf/:accountId/zones/:zoneId/dns` | List DNS records |
| POST | `/api/cf/:accountId/zones/:zoneId/dns` | Create DNS record |
| PUT | `/api/cf/:accountId/zones/:zoneId/dns/:recordId` | Update DNS record |
| DELETE | `/api/cf/:accountId/zones/:zoneId/dns/:recordId` | Delete DNS record |

### Worker Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/zones/:zoneId/routes` | List routes |
| POST | `/api/cf/:accountId/zones/:zoneId/routes` | Create route |
| DELETE | `/api/cf/:accountId/zones/:zoneId/routes/:routeId` | Delete route |

### KV Storage
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/kv/namespaces` | List namespaces |
| POST | `/api/cf/:accountId/kv/namespaces` | Create namespace |
| DELETE | `/api/cf/:accountId/kv/namespaces/:namespaceId` | Delete namespace |
| GET | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys` | List keys |
| GET | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | Get value |
| PUT | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | Put value |
| DELETE | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | Delete key |

### D1 Databases
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/d1/databases` | List databases |
| POST | `/api/cf/:accountId/d1/databases` | Create database |
| DELETE | `/api/cf/:accountId/d1/databases/:databaseId` | Delete database |
| POST | `/api/cf/:accountId/d1/databases/:databaseId/query` | Execute SQL |

### R2 Storage
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/r2/buckets` | List buckets |
| POST | `/api/cf/:accountId/r2/buckets` | Create bucket |
| DELETE | `/api/cf/:accountId/r2/buckets/:bucketName` | Delete bucket |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite database path |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | AES-256 encryption key for tokens |
| `ADMIN_USERNAME` | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | `admin` | Initial admin password |

## Tech Stack

- **Language**: Go 1.25
- **Web Framework**: Gin
- **Database**: SQLite + GORM
- **Cloudflare SDK**: cloudflare-go v0.116.0
- **Auth**: JWT (golang-jwt/jwt)
- **Encryption**: AES-256-GCM
