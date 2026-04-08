---
layout: home

hero:
  name: Cloudflare Manager
  text: 多账户管理平台
  tagline: 在一个 Docker 容器中统一管理所有 Cloudflare 账户的 Workers、域名、DNS、Pages、KV、D1、R2 资源。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: API 参考
      link: /zh/api/
    - theme: alt
      text: GitHub
      link: https://github.com/XimilalaXiang/cloudflare-manager

features:
  - title: 多账户管理
    details: 在统一仪表盘中管理无限数量的 Cloudflare 账户，各账户资源隔离。
  - title: Workers 管理
    details: 部署、查看源码、删除 Workers 脚本。查看版本历史和部署状态。按域名管理 Worker 路由。
  - title: 域名与 DNS
    details: 浏览域名，创建/编辑/删除 DNS 记录，支持类型选择、TTL 和代理切换。
  - title: 存储 (KV/D1/R2)
    details: KV 命名空间与键值完整管理，D1 数据库 SQL 查询控制台，R2 存储桶管理。
  - title: Pages 管理
    details: 创建和管理 Cloudflare Pages 项目。查看部署、环境和部署 URL。
  - title: 加密安全
    details: AES-256-GCM 加密 API 令牌，JWT 认证，bcrypt 密码哈希。
  - title: 单 Docker 镜像
    details: Go + SQLite 后端，React 前端 — 零外部依赖，秒级部署。
---
