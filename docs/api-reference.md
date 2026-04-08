---
layout: default
title: API Reference
nav_order: 3
---

# API Reference

All endpoints (except login) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

Base URL: `http://localhost:8080/api`

---

## Authentication

### POST /auth/login

Authenticate and receive a JWT token.

**Request Body:**

```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "created_at": "2026-04-07T00:00:00Z",
    "updated_at": "2026-04-07T00:00:00Z"
  }
}
```

### GET /auth/me

Get current authenticated user info.

**Response (200):**

```json
{
  "id": 1,
  "username": "admin",
  "created_at": "2026-04-07T00:00:00Z",
  "updated_at": "2026-04-07T00:00:00Z"
}
```

### POST /auth/change-password

Change the current user's password.

**Request Body:**

```json
{
  "old_password": "current-password",
  "new_password": "new-password-min-6-chars"
}
```

**Response (200):**

```json
{
  "message": "password changed successfully"
}
```

---

## Account Management

### GET /accounts

List all managed Cloudflare accounts.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "My Account",
    "email": "user@example.com",
    "account_id": "abc123...",
    "api_token_masked": "cfut****5bc3",
    "status": "active",
    "created_at": "2026-04-07T00:00:00Z",
    "updated_at": "2026-04-07T00:00:00Z"
  }
]
```

### POST /accounts

Add a new Cloudflare account. The API token is verified against Cloudflare before being stored.

**Request Body:**

```json
{
  "name": "My Account",
  "email": "user@example.com",
  "account_id": "your-cf-account-id",
  "api_token": "your-cf-api-token"
}
```

**Response (201):** Returns the created account (token is masked).

### GET /accounts/:id

Get a specific account by database ID.

### PUT /accounts/:id

Update an account. All fields are optional — only provided fields are updated.

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "api_token": "new-api-token"
}
```

### DELETE /accounts/:id

Soft-delete an account.

### POST /accounts/:id/verify

Verify that the stored API token is still valid against Cloudflare.

**Response (200):**

```json
{
  "status": "active"
}
```

---

## Workers

All Worker endpoints use the path prefix `/cf/:accountId/workers`, where `:accountId` is the **local database ID** of the account.

### GET /cf/:accountId/workers

List all Workers scripts.

**Response (200):**

```json
[
  {
    "id": "my-worker",
    "etag": "abc123",
    "size": 1024,
    "created_on": "2026-01-01T00:00:00Z",
    "modified_on": "2026-04-01T00:00:00Z"
  }
]
```

### POST /cf/:accountId/workers

Deploy a new Worker script.

**Request Body:**

```json
{
  "script_name": "my-worker",
  "content": "export default { fetch(req) { return new Response('Hello!') } }",
  "module": true
}
```

### GET /cf/:accountId/workers/:scriptName

Get the source code of a Worker script.

### DELETE /cf/:accountId/workers/:scriptName

Delete a Worker script.

---

## Zones & DNS

### GET /cf/:accountId/zones

List all zones (domains) for an account.

**Response (200):**

```json
[
  {
    "id": "zone-id-123",
    "name": "example.com",
    "status": "active",
    "paused": false,
    "name_servers": ["ns1.cloudflare.com", "ns2.cloudflare.com"]
  }
]
```

### GET /cf/:accountId/zones/:zoneId

Get details of a specific zone.

### GET /cf/:accountId/zones/:zoneId/dns

List all DNS records for a zone.

**Response (200):**

```json
[
  {
    "id": "record-id",
    "type": "A",
    "name": "example.com",
    "content": "1.2.3.4",
    "ttl": 3600,
    "proxied": true
  }
]
```

### POST /cf/:accountId/zones/:zoneId/dns

Create a DNS record.

**Request Body:**

```json
{
  "type": "A",
  "name": "sub.example.com",
  "content": "1.2.3.4",
  "ttl": 3600,
  "proxied": true
}
```

Supported types: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `NS`, etc.

For `MX` records, include `"priority": 10`.

### PUT /cf/:accountId/zones/:zoneId/dns/:recordId

Update a DNS record.

### DELETE /cf/:accountId/zones/:zoneId/dns/:recordId

Delete a DNS record.

---

## Worker Routes

### GET /cf/:accountId/zones/:zoneId/routes

List Worker routes for a zone.

### POST /cf/:accountId/zones/:zoneId/routes

Create a Worker route.

**Request Body:**

```json
{
  "pattern": "example.com/api/*",
  "script": "my-worker"
}
```

### DELETE /cf/:accountId/zones/:zoneId/routes/:routeId

Delete a Worker route.

---

## KV Storage

### GET /cf/:accountId/kv/namespaces

List KV namespaces.

### POST /cf/:accountId/kv/namespaces

Create a KV namespace.

**Request Body:**

```json
{
  "title": "MY_KV_NAMESPACE"
}
```

### DELETE /cf/:accountId/kv/namespaces/:namespaceId

Delete a KV namespace.

### GET /cf/:accountId/kv/namespaces/:namespaceId/keys

List keys in a namespace.

**Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `cursor` | Pagination cursor |
| `limit` | Max keys to return (default: 100) |

### GET /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Get the value for a key.

### PUT /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Store a value. Send the raw value as the request body.

### DELETE /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Delete a key.

---

## D1 Databases

### GET /cf/:accountId/d1/databases

List D1 databases.

### POST /cf/:accountId/d1/databases

Create a D1 database.

**Request Body:**

```json
{
  "name": "my-database"
}
```

### DELETE /cf/:accountId/d1/databases/:databaseId

Delete a D1 database.

### POST /cf/:accountId/d1/databases/:databaseId/query

Execute SQL on a D1 database.

**Request Body:**

```json
{
  "sql": "SELECT * FROM users WHERE id = ?",
  "params": ["1"]
}
```

---

## R2 Storage

### GET /cf/:accountId/r2/buckets

List R2 buckets.

### POST /cf/:accountId/r2/buckets

Create an R2 bucket.

**Request Body:**

```json
{
  "name": "my-bucket",
  "location": "wnam"
}
```

### DELETE /cf/:accountId/r2/buckets/:bucketName

Delete an R2 bucket.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "description of what went wrong"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 400 | Bad Request — invalid input or validation failure |
| 401 | Unauthorized — missing or invalid JWT token |
| 404 | Not Found — resource doesn't exist |
| 500 | Internal Server Error — server-side failure |
