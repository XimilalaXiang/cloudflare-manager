# Accounts

## GET /accounts

List all managed Cloudflare accounts.

**Response (200):**
```json
[{
  "id": 1, "name": "My Account", "email": "user@example.com",
  "account_id": "abc123...", "api_token_masked": "cfut****5bc3",
  "status": "active"
}]
```

## POST /accounts

Add a new account. Token is verified against Cloudflare before storage.

**Request:**
```json
{
  "name": "My Account", "email": "user@example.com",
  "account_id": "your-cf-account-id", "api_token": "your-cf-api-token"
}
```

## GET /accounts/:id

Get a specific account by database ID.

## PUT /accounts/:id

Update an account. All fields optional — only provided fields are updated. Omit `api_token` to keep the current token.

**Request:**
```json
{ "name": "Updated Name", "email": "new@example.com", "api_token": "new-token" }
```

## DELETE /accounts/:id

Soft-delete an account.

## POST /accounts/:id/verify

Verify the stored API token is still valid.

**Response (200):**
```json
{ "status": "active" }
```
