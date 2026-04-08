# 什么是 Cloudflare Manager？

Cloudflare Manager 是一个**自托管的多账户 Cloudflare 管理平台**，提供统一的 Web 界面和 REST API 来管理所有 Cloudflare 资源。

## 为什么选择它？

- **一个面板**管理所有账户、域名、Workers 和存储
- **加密存储凭据** — API 令牌永不以明文形式暴露
- **完整 CRUD** — DNS 记录、Workers、KV、D1、R2 和路由
- **Docker 就绪** — 一条命令完成部署

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Go 1.25 + Gin |
| 数据库 | SQLite + GORM |
| 前端 | React + Vite + Tailwind CSS |
| CF SDK | cloudflare-go v6 |
| 认证 | JWT + bcrypt |
| 加密 | AES-256-GCM |

## 功能覆盖

| 功能 | 后端 API | Web 界面 |
|------|:--------:|:--------:|
| 认证（登录、修改密码）| ✅ | ✅ |
| 账户增删改查 + 验证 | ✅ | ✅ |
| Workers（列表、部署、查看代码、删除）| ✅ | ✅ |
| Worker 版本与部署状态 | ✅ | ✅ |
| 域名与 DNS（列表、创建、编辑、删除）| ✅ | ✅ |
| Worker 路由（列表、创建、删除）| ✅ | ✅ |
| Pages（项目、部署）| ✅ | ✅ |
| KV（命名空间、键值对）| ✅ | ✅ |
| D1（数据库、SQL 查询）| ✅ | ✅ |
| R2（存储桶）| ✅ | ✅ |
| 国际化（中英文）| — | ✅ |
