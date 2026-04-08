# Pages

Manage Cloudflare Pages projects and deployments.

All endpoints use prefix `/cf/:accountId/pages`.

## GET /cf/:accountId/pages/projects

List all Pages projects.

**Response (200):**
```json
[
  {
    "name": "my-site",
    "id": "abc123",
    "subdomain": "my-site.pages.dev",
    "domains": ["my-site.pages.dev", "example.com"],
    "production_branch": "main",
    "created_on": "2025-01-15T10:30:00Z"
  }
]
```

## POST /cf/:accountId/pages/projects

Create a new Pages project.

**Request:**
```json
{
  "name": "my-new-site",
  "production_branch": "main"
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | Yes | — | Project name |
| `production_branch` | No | `main` | Production branch |

**Response (200):**
```json
{
  "name": "my-new-site",
  "id": "def456",
  "subdomain": "my-new-site.pages.dev",
  "domains": ["my-new-site.pages.dev"],
  "production_branch": "main",
  "created_on": "2025-01-15T10:30:00Z"
}
```

## GET /cf/:accountId/pages/projects/:projectName

Get details of a specific Pages project.

**Response (200):**
```json
{
  "name": "my-site",
  "id": "abc123",
  "subdomain": "my-site.pages.dev",
  "domains": ["my-site.pages.dev", "example.com"],
  "production_branch": "main",
  "created_on": "2025-01-15T10:30:00Z"
}
```

## DELETE /cf/:accountId/pages/projects/:projectName

Delete a Pages project.

**Response (200):**
```json
{ "message": "project deleted successfully" }
```

## GET /cf/:accountId/pages/projects/:projectName/deployments

List all deployments for a project.

**Response (200):**
```json
[
  {
    "id": "dep-abc123",
    "short_id": "abc123",
    "project_name": "my-site",
    "environment": "production",
    "url": "https://abc123.my-site.pages.dev",
    "latest_stage": "deploy: success",
    "created_on": "2025-01-15T10:30:00Z"
  }
]
```

## DELETE /cf/:accountId/pages/projects/:projectName/deployments/:deploymentId

Delete a specific deployment.

**Response (200):**
```json
{ "message": "deployment deleted successfully" }
```
