# 账户

## GET /accounts

列出所有 Cloudflare 账户。

**响应 (200)：**
```json
[{
  "id": 1, "name": "我的账户", "email": "user@example.com",
  "account_id": "abc123...", "api_token_masked": "cfut****5bc3",
  "status": "active"
}]
```

## POST /accounts

添加新账户。令牌会先通过 Cloudflare 验证。

**请求：**
```json
{
  "name": "我的账户", "email": "user@example.com",
  "account_id": "cf-account-id", "api_token": "cf-api-token"
}
```

## GET /accounts/:id

根据数据库 ID 获取账户详情。

## PUT /accounts/:id

更新账户信息。所有字段可选，省略 `api_token` 保持原令牌不变。

**请求：**
```json
{ "name": "新名称", "email": "new@example.com", "api_token": "新令牌" }
```

## DELETE /accounts/:id

软删除账户。

## POST /accounts/:id/verify

验证已存储的 API 令牌是否仍然有效。

**响应 (200)：**
```json
{ "status": "active" }
```
