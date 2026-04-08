# Cloudflare Manager

A self-hosted multi-account Cloudflare management platform with a modern web UI and REST API backend.

English | [中文](README_zh.md)

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/github/license/XimilalaXiang/cloudflare-manager)

## Features

### Account Management
- Multi-account support — manage multiple Cloudflare accounts from one place
- Encrypted API token storage (AES-256-GCM)
- Token verification

### Workers
- List, deploy, update, and delete Workers scripts
- View Worker source code
- Worker Versions history
- Worker Deployments status (strategy, percentage rollout)

### Zones & DNS
- List zones under each account
- Full DNS record management — create, edit, delete (A, AAAA, CNAME, MX, TXT, etc.)

### Worker Routes
- Create and manage Worker routes per zone

### Pages
- List, create, and delete Cloudflare Pages projects
- View project details (domains, production branch)
- List and delete Pages deployments

### Storage
- **KV** — Manage namespaces; list, get, put, and delete key-value pairs
- **D1** — Create/delete databases; execute SQL queries
- **R2** — Create, list, and delete storage buckets

### Security
- JWT authentication
- AES-256-GCM encrypted token storage
- CORS support
- bcrypt password hashing

### Frontend
- Modern React 19 SPA with Tailwind CSS 4
- i18n support (English / 中文)
- Responsive design
- Built-in SPA routing served by the Go backend

## Quick Start

### Docker Compose (Recommended)

```bash
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

The service will be available at `http://localhost:8091`.

### Docker Run

```bash
docker run -d \
  --name cloudflare-manager \
  -p 8091:8080 \
  -v cf-manager-data:/app/data \
  -e JWT_SECRET=your-secure-jwt-secret \
  -e ENCRYPTION_KEY=your-32-byte-encryption-key!! \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  ghcr.io/ximilalaxiang/cloudflare-manager:latest
```

### Build from Source

```bash
# Build frontend
cd web && npm ci && npm run build && cd ..

# Build backend
go build -o server ./cmd/server

# Run
./server
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite database path |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | AES-256 encryption key (must be 32 bytes) |
| `ADMIN_USERNAME` | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | `admin` | Initial admin password |

> **Important**: Change `JWT_SECRET`, `ENCRYPTION_KEY`, and `ADMIN_PASSWORD` before deploying to production.

## API Reference

Full API documentation is available via [VitePress docs](docs/) (`cd docs && npm run dev`).

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/auth/change-password` | Change password |

### Accounts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Add account |
| GET | `/api/accounts/:id` | Get account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |
| POST | `/api/accounts/:id/verify` | Verify token |

### Workers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/workers` | List workers |
| POST | `/api/cf/:accountId/workers` | Deploy worker |
| GET | `/api/cf/:accountId/workers/:scriptName` | Get worker code |
| DELETE | `/api/cf/:accountId/workers/:scriptName` | Delete worker |
| GET | `/api/cf/:accountId/workers/:scriptName/versions` | List versions |
| GET | `/api/cf/:accountId/workers/:scriptName/deployments` | Get deployments |

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

### Pages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cf/:accountId/pages/projects` | List projects |
| POST | `/api/cf/:accountId/pages/projects` | Create project |
| GET | `/api/cf/:accountId/pages/projects/:projectName` | Get project |
| DELETE | `/api/cf/:accountId/pages/projects/:projectName` | Delete project |
| GET | `/api/cf/:accountId/pages/projects/:projectName/deployments` | List deployments |
| DELETE | `/api/cf/:accountId/pages/projects/:projectName/deployments/:deploymentId` | Delete deployment |

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

## Project Structure

```
cloudflare-manager/
├── cmd/server/          # Application entrypoint
├── internal/
│   ├── config/          # Environment configuration
│   ├── database/        # SQLite + GORM setup
│   ├── handlers/        # HTTP handlers & router
│   ├── middleware/       # Auth (JWT) & CORS middleware
│   ├── models/          # Database models
│   ├── services/        # Business logic (CF API calls)
│   └── utils/           # Utilities
├── pkg/crypto/          # AES-256-GCM encryption
├── web/                 # React frontend (Vite + Tailwind)
│   └── src/
│       ├── pages/       # Login, Dashboard, Workers, Zones, etc.
│       ├── components/  # Shared components (Navbar)
│       ├── i18n/        # Internationalization (en/zh)
│       └── hooks/       # Custom React hooks
├── docs/                # VitePress documentation (en/zh)
├── .github/workflows/   # CI/CD (tests, Docker build, docs deploy)
├── Dockerfile           # Multi-stage build (frontend + backend)
└── docker-compose.yml   # Docker Compose config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.25, Gin, GORM, SQLite |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| Cloudflare SDK | cloudflare-go v6 |
| Auth | JWT (golang-jwt), bcrypt |
| Encryption | AES-256-GCM |
| CI/CD | GitHub Actions (test, Docker multi-arch build, docs deploy) |
| Container | Multi-arch Docker images (amd64/arm64) via GHCR |
| Docs | VitePress |

## CI/CD

The project includes three GitHub Actions workflows:

- **test.yml** — Runs Go tests on push
- **docker.yml** — Builds and pushes multi-arch Docker images (linux/amd64, linux/arm64) to `ghcr.io`
- **pages.yml** — Deploys VitePress documentation to GitHub Pages

## License

MIT
