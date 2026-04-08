# Workers

所有接口前缀：`/cf/:accountId/workers`

## GET /cf/:accountId/workers

列出所有 Workers 脚本。

**响应 (200)：**
```json
[{ "id": "my-worker", "size": 1024, "created_on": "...", "modified_on": "..." }]
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

## GET /cf/:accountId/workers/:scriptName

获取 Worker 源代码。

**响应 (200)：**
```json
{ "script_name": "my-worker", "code": "export default { ... }" }
```

## DELETE /cf/:accountId/workers/:scriptName

删除 Worker 脚本。
