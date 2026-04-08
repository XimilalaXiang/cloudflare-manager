# KV Storage

## GET /cf/:accountId/kv/namespaces

List KV namespaces.

## POST /cf/:accountId/kv/namespaces

Create a namespace.

**Request:**
```json
{ "title": "MY_KV_NAMESPACE" }
```

## DELETE /cf/:accountId/kv/namespaces/:namespaceId

Delete a namespace.

## GET /cf/:accountId/kv/namespaces/:namespaceId/keys

List keys. Query params: `cursor`, `limit` (default 100).

## GET /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Get value for a key.

## PUT /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Store a value. Send raw value as request body.

## DELETE /cf/:accountId/kv/namespaces/:namespaceId/keys/:key

Delete a key.
