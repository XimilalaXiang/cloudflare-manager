# API 参考

除登录外，所有接口需在请求头携带 JWT 令牌：

```
Authorization: Bearer <your-token>
```

基础 URL：`http://localhost:8080/api`

## 接口总览

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录 |
| GET | `/auth/me` | 当前用户 |
| POST | `/auth/change-password` | 修改密码 |

### 账户管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/accounts` | 列出账户 |
| POST | `/accounts` | 创建账户 |
| GET | `/accounts/:id` | 获取账户 |
| PUT | `/accounts/:id` | 更新账户 |
| DELETE | `/accounts/:id` | 删除账户 |
| POST | `/accounts/:id/verify` | 验证 Token |

### Workers
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/workers` | 列出 Workers |
| POST | `/cf/:accountId/workers` | 部署 Worker |
| GET | `/cf/:accountId/workers/:name` | 获取代码 |
| DELETE | `/cf/:accountId/workers/:name` | 删除 Worker |
| GET | `/cf/:accountId/workers/:name/versions` | 版本列表 |
| GET | `/cf/:accountId/workers/:name/deployments` | 部署状态 |

### 域名与 DNS
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/zones` | 列出域名 |
| GET | `/cf/:accountId/zones/:zoneId` | 域名详情 |
| GET | `/cf/:accountId/zones/:zoneId/dns` | DNS 记录 |
| POST | `/cf/:accountId/zones/:zoneId/dns` | 创建记录 |
| PUT | `/cf/:accountId/zones/:zoneId/dns/:id` | 更新记录 |
| DELETE | `/cf/:accountId/zones/:zoneId/dns/:id` | 删除记录 |

### Worker 路由
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/zones/:zoneId/routes` | 列出路由 |
| POST | `/cf/:accountId/zones/:zoneId/routes` | 创建路由 |
| DELETE | `/cf/:accountId/zones/:zoneId/routes/:id` | 删除路由 |

### Pages
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/pages/projects` | 列出项目 |
| POST | `/cf/:accountId/pages/projects` | 创建项目 |
| GET | `/cf/:accountId/pages/projects/:name` | 项目详情 |
| DELETE | `/cf/:accountId/pages/projects/:name` | 删除项目 |
| GET | `/cf/:accountId/pages/projects/:name/deployments` | 部署列表 |
| DELETE | `/cf/:accountId/pages/projects/:name/deployments/:id` | 删除部署 |

### KV 存储
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/kv/namespaces` | 列出命名空间 |
| POST | `/cf/:accountId/kv/namespaces` | 创建命名空间 |
| DELETE | `/cf/:accountId/kv/namespaces/:id` | 删除命名空间 |
| GET | `/cf/:accountId/kv/namespaces/:id/keys` | 列出键 |
| GET | `/cf/:accountId/kv/namespaces/:id/keys/:key` | 获取值 |
| PUT | `/cf/:accountId/kv/namespaces/:id/keys/:key` | 写入值 |
| DELETE | `/cf/:accountId/kv/namespaces/:id/keys/:key` | 删除键 |

### D1 数据库
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/d1/databases` | 列出数据库 |
| POST | `/cf/:accountId/d1/databases` | 创建数据库 |
| DELETE | `/cf/:accountId/d1/databases/:id` | 删除数据库 |
| POST | `/cf/:accountId/d1/databases/:id/query` | SQL 查询 |

### R2 存储
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cf/:accountId/r2/buckets` | 列出存储桶 |
| POST | `/cf/:accountId/r2/buckets` | 创建存储桶 |
| DELETE | `/cf/:accountId/r2/buckets/:name` | 删除存储桶 |

## 错误格式

```json
{
  "error": "错误描述信息"
}
```

| 状态码 | 含义 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
