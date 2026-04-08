# 架构设计

## 三层架构

```
HTTP 请求 → 处理器 (Handlers) → 服务层 (Services) → 数据库 + Cloudflare API
```

- **处理器** — 解析 HTTP 请求，验证输入，返回响应
- **服务层** — 业务逻辑，通过 `cloudflare-go` 调用 CF API
- **数据库** — GORM + SQLite 持久化，AES-256-GCM 加密敏感数据

## 安全设计

### 令牌加密流程
```
用户提供 API 令牌 → 验证 → AES-256-GCM 加密 → 存入 SQLite
```

### 认证流程
```
登录 → bcrypt 验证 → 生成 JWT（24h） → 后续请求携带 Authorization 头
```
