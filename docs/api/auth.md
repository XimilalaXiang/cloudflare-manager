# Authentication

## POST /auth/login

Authenticate and receive a JWT token.

**Request:**
```json
{ "username": "admin", "password": "your-password" }
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin" }
}
```

## GET /auth/me

Get current authenticated user info.

**Response (200):**
```json
{ "id": 1, "username": "admin", "created_at": "...", "updated_at": "..." }
```

## POST /auth/change-password

Change the current user's password. Minimum 6 characters.

**Request:**
```json
{ "old_password": "current", "new_password": "new-min-6-chars" }
```

**Response (200):**
```json
{ "message": "password changed successfully" }
```
