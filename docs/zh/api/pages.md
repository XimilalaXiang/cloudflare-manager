# Pages

管理 Cloudflare Pages 项目及部署。

所有接口前缀：`/cf/:accountId/pages`

## GET /cf/:accountId/pages/projects

列出所有 Pages 项目。

**响应 (200)：**
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

创建新的 Pages 项目。

**请求：**
```json
{
  "name": "my-new-site",
  "production_branch": "main"
}
```

| 字段 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | 是 | — | 项目名称 |
| `production_branch` | 否 | `main` | 生产分支 |

**响应 (200)：**
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

获取 Pages 项目详情。

**响应 (200)：**
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

删除 Pages 项目。

**响应 (200)：**
```json
{ "message": "project deleted successfully" }
```

## GET /cf/:accountId/pages/projects/:projectName/deployments

列出项目的所有部署。

**响应 (200)：**
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

删除指定部署。

**响应 (200)：**
```json
{ "message": "deployment deleted successfully" }
```
