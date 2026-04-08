# What is Cloudflare Manager?

Cloudflare Manager is a **self-hosted, multi-account Cloudflare management platform** that provides a unified web UI and REST API to manage all your Cloudflare resources.

## Why?

Managing multiple Cloudflare accounts through the official dashboard is tedious. Cloudflare Manager gives you:

- **One dashboard** for all accounts, zones, Workers, and storage
- **Encrypted credential storage** — API tokens never exposed in responses
- **Full CRUD** for DNS records, Workers, KV, D1, R2, and routes
- **Docker-ready** — deploy with a single command

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Go 1.25 + Gin |
| Database | SQLite + GORM |
| Frontend | React + Vite + Tailwind CSS |
| Cloudflare SDK | cloudflare-go v6 |
| Auth | JWT + bcrypt |
| Encryption | AES-256-GCM |

## Feature Matrix

| Feature | Backend API | Web UI |
|---------|:-----------:|:------:|
| Auth (login, change password) | ✅ | ✅ |
| Account CRUD + verify | ✅ | ✅ |
| Workers (list, deploy, view code, delete) | ✅ | ✅ |
| Worker Versions & Deployments | ✅ | ✅ |
| Zones & DNS (list, create, edit, delete) | ✅ | ✅ |
| Worker Routes (list, create, delete) | ✅ | ✅ |
| Pages (projects, deployments) | ✅ | ✅ |
| KV (namespaces, keys, values) | ✅ | ✅ |
| D1 (databases, SQL query) | ✅ | ✅ |
| R2 (buckets) | ✅ | ✅ |
| i18n (English / Chinese) | — | ✅ |
