# KV 存储

## GET /cf/:accountId/kv/namespaces

列出 KV 命名空间。

## POST /cf/:accountId/kv/namespaces

创建命名空间。

**请求：**
```json
{ "title": "MY_KV_NAMESPACE" }
```

## DELETE /cf/:accountId/kv/namespaces/:namespaceId

删除命名空间。

## GET /cf/:accountId/kv/namespaces/:namespaceId/keys

列出键。查询参数：`cursor`、`limit`（默认 100）。

## GET /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

获取键的值。

## PUT /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

写入值。请求体为原始值内容。

## DELETE /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

删除键。
