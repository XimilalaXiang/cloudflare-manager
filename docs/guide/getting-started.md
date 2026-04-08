# Getting Started

## Prerequisites

- Docker and Docker Compose (recommended), or
- Go 1.25+ with CGO support

## Quick Start with Docker

```bash
docker run -d --name cloudflare-manager \
  -p 8080:8080 \
  -v cf-data:/app/data \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e ENCRYPTION_KEY="$(openssl rand -base64 24 | head -c 32)" \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=changeme \
  ghcr.io/ximilalaxiang/cloudflare-manager:latest
```

Or use Docker Compose:

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

The web UI will be at `http://localhost:8080`.

## First Steps

### 1. Login

Open `http://localhost:8080` in your browser and log in with your admin credentials.

### 2. Change Default Password

Click the **PASSWORD** button in the top navigation bar to change your default password.

### 3. Add a Cloudflare Account

Go to **ACCOUNTS** → **ADD ACCOUNT** and provide:
- A display name
- Your Cloudflare Account ID
- A Cloudflare API Token

The token is verified against Cloudflare before storage and encrypted with AES-256-GCM.

### 4. Explore

Navigate to **Workers**, **Zones**, **Storage**, or **Routes** to manage your Cloudflare resources.

## Getting a Cloudflare API Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit zone DNS** template, or create a custom token
4. Copy the generated token

::: tip
Create tokens with the minimum required permissions for your use case.
:::
