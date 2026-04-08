# Docker Deployment

## Docker Compose (Recommended)

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
# Edit .env with secure values
docker compose up -d
```

### docker-compose.yml

```yaml
services:
  cloudflare-manager:
    image: ghcr.io/ximilalaxiang/cloudflare-manager:latest
    container_name: cloudflare-manager
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - cf-manager-data:/app/data
    environment:
      - PORT=8080
      - JWT_SECRET=${JWT_SECRET:-change-me-in-production}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-change-me-32-bytes-encryption!!}
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin}

volumes:
  cf-manager-data:
```

## Data Persistence

The SQLite database is stored in a Docker volume `cf-manager-data`. This ensures data survives container restarts and upgrades.

### Backup

```bash
docker cp cloudflare-manager:/app/data/cloudflare-manager.db ./backup.db
```

## Upgrading

```bash
docker compose pull
docker compose up -d
```

The database schema is automatically migrated on startup via GORM's `AutoMigrate`.

## Reverse Proxy

In production, use a reverse proxy with TLS:

**Caddy:**

```
cf-manager.yourdomain.com {
    reverse_proxy localhost:8080
}
```

**Nginx:**

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
    }
}
```

## Security Checklist

- Change default admin password immediately
- Set strong `JWT_SECRET` and `ENCRYPTION_KEY`
- Use HTTPS via reverse proxy
- Restrict network access to the API port
- Regularly back up the SQLite database
- Use Cloudflare API tokens with minimum permissions
