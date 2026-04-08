# 域名与 DNS

## GET /cf/:accountId/zones

列出账户下所有域名。

**响应 (200)：**
```json
[{ "id": "zone-id", "name": "example.com", "status": "active", "paused": false }]
```

## GET /cf/:accountId/zones/:zoneId

获取域名详情。

## GET /cf/:accountId/zones/:zoneId/dns

列出 DNS 记录。

**响应 (200)：**
```json
[{ "id": "record-id", "type": "A", "name": "example.com", "content": "1.2.3.4", "ttl": 3600, "proxied": true }]
```

## POST /cf/:accountId/zones/:zoneId/dns

创建 DNS 记录。

**请求：**
```json
{ "type": "A", "name": "sub.example.com", "content": "1.2.3.4", "ttl": 1, "proxied": true }
```

## PUT /cf/:accountId/zones/:zoneId/dns/:recordId

更新 DNS 记录（请求格式同创建）。

## DELETE /cf/:accountId/zones/:zoneId/dns/:recordId

删除 DNS 记录。
