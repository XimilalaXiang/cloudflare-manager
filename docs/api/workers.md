# Workers

Manage Cloudflare Workers scripts, versions, and deployments.

All endpoints use prefix `/cf/:accountId/workers`.

## GET /cf/:accountId/workers

List all Workers scripts.

**Response (200):**
```json
[
  {
    "id": "my-worker",
    "etag": "abc123...",
    "created_on": "2025-01-15T10:30:00Z",
    "modified_on": "2025-01-16T08:00:00Z"
  }
]
```

## POST /cf/:accountId/workers

Deploy a Worker script.

**Request:**
```json
{
  "script_name": "my-worker",
  "content": "export default { fetch(req) { return new Response('Hello!') } }",
  "module": true
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `script_name` | Yes | — | Script name |
| `content` | Yes | — | Worker source code |
| `module` | No | `false` | Use ES Module format (`.mjs`) |

**Response (200):**
```json
{ "message": "worker deployed successfully", "script_name": "my-worker" }
```

## GET /cf/:accountId/workers/:scriptName

Get Worker source code.

**Response (200):**
```json
{ "script_name": "my-worker", "code": "export default { ... }" }
```

## DELETE /cf/:accountId/workers/:scriptName

Delete a Worker script.

**Response (200):**
```json
{ "message": "worker deleted successfully" }
```

## GET /cf/:accountId/workers/:scriptName/versions

List version history for a Worker script.

**Response (200):**
```json
[
  {
    "id": "ver-abc123",
    "number": 3,
    "created_on": "2025-01-16T08:00:00Z",
    "modified_on": "2025-01-16T08:00:00Z",
    "author_email": "user@example.com",
    "source": "api"
  }
]
```

| Field | Description |
|-------|-------------|
| `id` | Version ID |
| `number` | Version number |
| `created_on` | Creation timestamp |
| `modified_on` | Last modified timestamp |
| `author_email` | Email of the author |
| `source` | How the version was created (e.g. `api`, `dash`) |

## GET /cf/:accountId/workers/:scriptName/deployments

Get current deployment information for a Worker script.

**Response (200):**
```json
{
  "id": "dep-abc123",
  "source": "api",
  "strategy": "percentage",
  "author_email": "user@example.com",
  "created_on": "2025-01-16T08:00:00Z",
  "message": "Deployed via API",
  "versions": [
    { "version_id": "ver-abc123", "percentage": 100 }
  ]
}
```

| Field | Description |
|-------|-------------|
| `id` | Deployment ID |
| `source` | Deployment source |
| `strategy` | Deployment strategy (e.g. `percentage`) |
| `versions` | Array of version assignments with traffic percentages |
| `message` | Optional deployment message |
