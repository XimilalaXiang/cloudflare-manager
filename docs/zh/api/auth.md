# 认证

## POST /auth/login

登录并获取 JWT 令牌。

**请求：**
```json
{ "username": "admin", "password": "your-password" }
```

**响应 (200)：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin" }
}
```

## GET /auth/me

获取当前登录用户信息。

**响应 (200)：**
```json
{ "id": 1, "username": "admin", "created_at": "...", "updated_at": "..." }
```

## POST /auth/change-password

修改当前用户密码，最少 6 个字符。

**请求：**
```json
{ "old_password": "当前密码", "new_password": "新密码至少6位" }
```

**响应 (200)：**
```json
{ "message": "password changed successfully" }
```
