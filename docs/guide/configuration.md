# Configuration

All configuration is through environment variables.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server listen port |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite database file path |
| `JWT_SECRET` | `change-me-in-production` | Secret for JWT token signing |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | 32-byte key for AES-256-GCM encryption |
| `ADMIN_USERNAME` | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | `admin` | Initial admin password |

::: warning
Always change `JWT_SECRET` and `ENCRYPTION_KEY` to strong random values in production!
:::

## Generating Secure Secrets

```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key (must be exactly 32 characters)
openssl rand -base64 24 | head -c 32
```

## Example `.env` File

```env
PORT=8080
JWT_SECRET=your-secure-random-secret-here
ENCRYPTION_KEY=your-32-byte-encryption-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```
