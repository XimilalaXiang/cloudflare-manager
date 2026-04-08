---
layout: default
title: Deployment
nav_order: 5
---

# Deployment

## Docker Compose (Recommended)

The simplest way to deploy Cloudflare Manager:

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
```

Edit `.env`:

```env
PORT=8080
JWT_SECRET=<generate-a-strong-random-string>
ENCRYPTION_KEY=<generate-a-32-byte-random-string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-secure-password>
```

Generate secure secrets:

```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key (must be exactly 32 characters)
openssl rand -base64 24 | head -c 32
```

Start the service:

```bash
docker compose up -d
```

### Data Persistence

The `docker-compose.yml` uses a named volume `cf-manager-data` for the SQLite database. This ensures data survives container restarts and upgrades.

To back up your data:

```bash
docker cp cloudflare-manager:/app/data/cloudflare-manager.db ./backup.db
```

## Manual Build

Requirements:
- Go 1.25+
- GCC (for CGO/SQLite)

```bash
go build -o server ./cmd/server
```

Run with environment variables:

```bash
export PORT=8080
export JWT_SECRET="your-secure-secret"
export ENCRYPTION_KEY="your-32-byte-encryption-key!!!!!"
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD="your-password"

./server
```

## Production Considerations

### Reverse Proxy

In production, place the API behind a reverse proxy (Nginx, Caddy, Traefik) with TLS:

**Nginx example:**

```nginx
server {
    listen 443 ssl;
    server_name cf-manager.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Caddy example:**

```
cf-manager.yourdomain.com {
    reverse_proxy localhost:8080
}
```

### Security Checklist

- [ ] Change default admin password immediately after first login
- [ ] Set strong, unique `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Use HTTPS (TLS) via reverse proxy
- [ ] Restrict network access to the API port
- [ ] Regularly back up the SQLite database
- [ ] Use Cloudflare API tokens with minimum required permissions

### Health Check

You can verify the service is running:

```bash
curl http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

A `200` response confirms the service is operational.

## Upgrading

```bash
cd cloudflare-manager
git pull
docker compose build
docker compose up -d
```

The SQLite database schema is automatically migrated on startup via GORM's `AutoMigrate`.
