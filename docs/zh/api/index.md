# API 参考

除登录外，所有接口需在请求头携带 JWT 令牌：

```
Authorization: Bearer <your-token>
```

基础 URL：`http://localhost:8080/api`

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录 |
| GET | `/auth/me` | 当前用户 |
| POST | `/auth/change-password` | 修改密码 |
| GET/POST/PUT/DELETE | `/accounts` | 账户管理 |
| GET/POST/DELETE | `/cf/:id/workers` | Workers 管理 |
| GET/POST/PUT/DELETE | `/cf/:id/zones/:zoneId/dns` | DNS 管理 |
| GET/POST/DELETE | `/cf/:id/zones/:zoneId/routes` | 路由管理 |
| GET/POST/DELETE | `/cf/:id/kv/namespaces` | KV 管理 |
| GET/POST/DELETE | `/cf/:id/d1/databases` | D1 管理 |
| GET/POST/DELETE | `/cf/:id/r2/buckets` | R2 管理 |

详细文档请参阅各子页面。
