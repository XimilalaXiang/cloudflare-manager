# Docker 部署

## Docker Compose（推荐）

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
docker compose up -d
```

## 数据持久化
SQLite 数据库存储在 Docker 卷中，容器重启后数据不丢失。

```bash
# 备份
docker cp cloudflare-manager:/app/data/cloudflare-manager.db ./backup.db
```

## 升级

```bash
docker compose pull
docker compose up -d
```

## 安全清单
- 立即修改默认密码
- 设置强随机 `JWT_SECRET` 和 `ENCRYPTION_KEY`
- 通过反向代理启用 HTTPS
- 定期备份数据库
