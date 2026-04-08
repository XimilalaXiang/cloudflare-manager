# 配置说明

通过环境变量配置所有选项。

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `8080` | 服务监听端口 |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite 数据库路径 |
| `JWT_SECRET` | `change-me-in-production` | JWT 签名密钥 |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | AES-256-GCM 加密密钥（32 字节）|
| `ADMIN_USERNAME` | `admin` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | `admin` | 初始管理员密码 |

::: warning
生产环境务必修改 `JWT_SECRET` 和 `ENCRYPTION_KEY`！
:::

## 生成安全密钥

```bash
# JWT 密钥
openssl rand -base64 32

# 加密密钥（必须 32 字符）
openssl rand -base64 24 | head -c 32
```
