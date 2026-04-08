---
layout: default
title: Home
nav_order: 1
---

# Cloudflare Manager

A self-hosted, multi-account Cloudflare management platform with a secure REST API backend.

## Why Cloudflare Manager?

Managing multiple Cloudflare accounts through the dashboard can be tedious and error-prone. Cloudflare Manager provides a unified API to manage all your accounts, zones, Workers, KV, D1, and R2 resources from a single interface.

## Key Features

- **Multi-Account** — Manage unlimited Cloudflare accounts from one platform
- **Secure Storage** — API tokens encrypted with AES-256-GCM, never exposed in responses
- **Full Cloudflare Coverage** — Workers, Zones, DNS, KV, D1, R2, and Worker Routes
- **JWT Auth** — Protected API with token-based authentication
- **Audit Logging** — Track all operations for compliance
- **Docker Ready** — One-command deployment with Docker Compose
- **Lightweight** — Single Go binary with SQLite, no external database needed

## Quick Start

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

The API will be available at `http://localhost:8080`.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Go 1.25 |
| Framework | Gin |
| Database | SQLite + GORM |
| Cloudflare SDK | cloudflare-go v0.116.0 |
| Authentication | JWT (golang-jwt) |
| Encryption | AES-256-GCM |

## Pages

- [Getting Started](getting-started) — Installation, configuration, and first steps
- [API Reference](api-reference) — Complete API endpoint documentation
- [Architecture](architecture) — System design and code structure
- [Deployment](deployment) — Docker, manual, and production deployment guides
