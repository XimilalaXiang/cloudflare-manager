# Worker 路由

## GET /cf/:accountId/zones/:zoneId/routes

列出域名下的 Worker 路由。

## POST /cf/:accountId/zones/:zoneId/routes

创建 Worker 路由。

**请求：**
```json
{ "pattern": "example.com/api/*", "script": "my-worker" }
```

## DELETE /cf/:accountId/zones/:zoneId/routes/:routeId

删除 Worker 路由。
