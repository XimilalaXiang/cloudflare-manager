# Workers

管理 Cloudflare Workers 脚本、版本和部署。

所有接口前缀：`/cf/:accountId/workers`

## GET /cf/:accountId/workers

列出所有 Workers 脚本。

**响应 (200)：**
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

部署 Worker 脚本。

**请求：**
```json
{
  "script_name": "my-worker",
  "content": "export default { fetch(req) { return new Response('Hello!') } }",
  "module": true
}
```

| 字段 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `script_name` | 是 | — | 脚本名称 |
| `content` | 是 | — | Worker 源代码 |
| `module` | 否 | `false` | 使用 ES Module 格式 (`.mjs`) |

**响应 (200)：**
```json
{ "message": "worker deployed successfully", "script_name": "my-worker" }
```

## GET /cf/:accountId/workers/:scriptName

获取 Worker 源代码。

**响应 (200)：**
```json
{ "script_name": "my-worker", "code": "export default { ... }" }
```

## DELETE /cf/:accountId/workers/:scriptName

删除 Worker 脚本。

**响应 (200)：**
```json
{ "message": "worker deleted successfully" }
```

## GET /cf/:accountId/workers/:scriptName/versions

列出 Worker 脚本的版本历史。

**响应 (200)：**
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

| 字段 | 说明 |
|------|------|
| `id` | 版本 ID |
| `number` | 版本号 |
| `created_on` | 创建时间 |
| `modified_on` | 修改时间 |
| `author_email` | 作者邮箱 |
| `source` | 版本创建来源（如 `api`、`dash`） |

## GET /cf/:accountId/workers/:scriptName/deployments

获取 Worker 脚本当前的部署信息。

**响应 (200)：**
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

| 字段 | 说明 |
|------|------|
| `id` | 部署 ID |
| `source` | 部署来源 |
| `strategy` | 部署策略（如 `percentage`） |
| `versions` | 版本分配数组，包含流量百分比 |
| `message` | 可选的部署说明信息 |
