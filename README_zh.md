# Cloudflare Manager

自托管的多账号 Cloudflare 管理平台，提供现代化 Web 界面与 REST API。

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/github/license/XimilalaXiang/cloudflare-manager)

[English](README.md) | 中文

## 功能特性

### 账号管理
- 多账号支持 — 在同一平台管理多个 Cloudflare 账号
- API Token 加密存储（AES-256-GCM）
- Token 有效性验证

### Workers
- 列出、部署、更新、删除 Workers 脚本
- 查看 Worker 源代码
- Worker 版本历史记录
- Worker 部署状态（策略、百分比灰度发布）

### Zones & DNS
- 列出账号下所有域名（Zone）
- 完整 DNS 记录管理 — 创建、编辑、删除（A、AAAA、CNAME、MX、TXT 等）

### Worker Routes
- 创建和管理每个域名的 Worker 路由规则

### Pages
- 列出、创建、删除 Cloudflare Pages 项目
- 查看项目详情（域名、生产分支）
- 列出和删除 Pages 部署

### 存储
- **KV** — 管理命名空间；列出、读取、写入、删除键值对
- **D1** — 创建/删除数据库；执行 SQL 查询
- **R2** — 创建、列出、删除存储桶

### 安全特性
- JWT 身份认证
- AES-256-GCM 加密存储 Token
- CORS 跨域支持
- bcrypt 密码哈希

### 前端界面
- 基于 React 19 的现代化 SPA，搭配 Tailwind CSS 4
- 国际化支持（English / 中文）
- 响应式设计
- 内置 SPA 路由，由 Go 后端统一提供服务

## 快速开始

### Docker Compose（推荐）

```bash
cp .env.example .env
# 编辑 .env 配置你的参数
docker compose up -d
```

服务将在 `http://localhost:8091` 启动。

### Docker Run

```bash
docker run -d \
  --name cloudflare-manager \
  -p 8091:8080 \
  -v cf-manager-data:/app/data \
  -e JWT_SECRET=你的JWT密钥 \
  -e ENCRYPTION_KEY=你的32字节加密密钥!!!!! \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=你的安全密码 \
  ghcr.io/ximilalaxiang/cloudflare-manager:latest
```

### 从源码构建

```bash
# 构建前端
cd web && npm ci && npm run build && cd ..

# 构建后端
go build -o server ./cmd/server

# 运行
./server
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `8080` | 服务端口 |
| `DATABASE_PATH` | `data/cloudflare-manager.db` | SQLite 数据库路径 |
| `JWT_SECRET` | `change-me-in-production` | JWT 签名密钥 |
| `ENCRYPTION_KEY` | `change-me-32-bytes-encryption!!` | AES-256 加密密钥（必须 32 字节） |
| `ADMIN_USERNAME` | `admin` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | `admin` | 初始管理员密码 |

> **重要**：部署到生产环境前，请务必修改 `JWT_SECRET`、`ENCRYPTION_KEY` 和 `ADMIN_PASSWORD`。

## API 文档

完整 API 文档可通过 [VitePress 文档站](docs/) 查看（`cd docs && npm run dev`）。

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| POST | `/api/auth/change-password` | 修改密码 |

### 账号管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/accounts` | 列出所有账号 |
| POST | `/api/accounts` | 添加账号 |
| GET | `/api/accounts/:id` | 获取账号详情 |
| PUT | `/api/accounts/:id` | 更新账号 |
| DELETE | `/api/accounts/:id` | 删除账号 |
| POST | `/api/accounts/:id/verify` | 验证 Token |

### Workers
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/workers` | 列出 Workers |
| POST | `/api/cf/:accountId/workers` | 部署 Worker |
| GET | `/api/cf/:accountId/workers/:scriptName` | 获取 Worker 代码 |
| DELETE | `/api/cf/:accountId/workers/:scriptName` | 删除 Worker |
| GET | `/api/cf/:accountId/workers/:scriptName/versions` | 列出版本 |
| GET | `/api/cf/:accountId/workers/:scriptName/deployments` | 获取部署状态 |

### Zones & DNS
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/zones` | 列出域名 |
| GET | `/api/cf/:accountId/zones/:zoneId` | 域名详情 |
| GET | `/api/cf/:accountId/zones/:zoneId/dns` | 列出 DNS 记录 |
| POST | `/api/cf/:accountId/zones/:zoneId/dns` | 创建 DNS 记录 |
| PUT | `/api/cf/:accountId/zones/:zoneId/dns/:recordId` | 更新 DNS 记录 |
| DELETE | `/api/cf/:accountId/zones/:zoneId/dns/:recordId` | 删除 DNS 记录 |

### Worker Routes
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/zones/:zoneId/routes` | 列出路由 |
| POST | `/api/cf/:accountId/zones/:zoneId/routes` | 创建路由 |
| DELETE | `/api/cf/:accountId/zones/:zoneId/routes/:routeId` | 删除路由 |

### Pages
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/pages/projects` | 列出项目 |
| POST | `/api/cf/:accountId/pages/projects` | 创建项目 |
| GET | `/api/cf/:accountId/pages/projects/:projectName` | 获取项目详情 |
| DELETE | `/api/cf/:accountId/pages/projects/:projectName` | 删除项目 |
| GET | `/api/cf/:accountId/pages/projects/:projectName/deployments` | 列出部署 |
| DELETE | `/api/cf/:accountId/pages/projects/:projectName/deployments/:deploymentId` | 删除部署 |

### KV 存储
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/kv/namespaces` | 列出命名空间 |
| POST | `/api/cf/:accountId/kv/namespaces` | 创建命名空间 |
| DELETE | `/api/cf/:accountId/kv/namespaces/:namespaceId` | 删除命名空间 |
| GET | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys` | 列出键 |
| GET | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | 获取值 |
| PUT | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | 写入值 |
| DELETE | `/api/cf/:accountId/kv/namespaces/:namespaceId/keys/:key` | 删除键 |

### D1 数据库
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/d1/databases` | 列出数据库 |
| POST | `/api/cf/:accountId/d1/databases` | 创建数据库 |
| DELETE | `/api/cf/:accountId/d1/databases/:databaseId` | 删除数据库 |
| POST | `/api/cf/:accountId/d1/databases/:databaseId/query` | 执行 SQL |

### R2 存储
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cf/:accountId/r2/buckets` | 列出存储桶 |
| POST | `/api/cf/:accountId/r2/buckets` | 创建存储桶 |
| DELETE | `/api/cf/:accountId/r2/buckets/:bucketName` | 删除存储桶 |

## 项目结构

```
cloudflare-manager/
├── cmd/server/          # 应用入口
├── internal/
│   ├── config/          # 环境配置
│   ├── database/        # SQLite + GORM 数据库
│   ├── handlers/        # HTTP 处理器和路由
│   ├── middleware/       # 认证 (JWT) 和 CORS 中间件
│   ├── models/          # 数据库模型
│   ├── services/        # 业务逻辑（Cloudflare API 调用）
│   └── utils/           # 工具函数
├── pkg/crypto/          # AES-256-GCM 加密工具
├── web/                 # React 前端 (Vite + Tailwind)
│   └── src/
│       ├── pages/       # 登录、仪表盘、Workers、Zones 等页面
│       ├── components/  # 共享组件 (Navbar)
│       ├── i18n/        # 国际化 (en/zh)
│       └── hooks/       # 自定义 React Hooks
├── docs/                # VitePress 文档（中英文）
├── .github/workflows/   # CI/CD（测试、Docker 构建、文档部署）
├── Dockerfile           # 多阶段构建（前端 + 后端）
└── docker-compose.yml   # Docker Compose 配置
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Go 1.25, Gin, GORM, SQLite |
| 前端 | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| Cloudflare SDK | cloudflare-go v6 |
| 认证 | JWT (golang-jwt), bcrypt |
| 加密 | AES-256-GCM |
| CI/CD | GitHub Actions（测试、Docker 多架构构建、文档部署） |
| 容器 | 多架构 Docker 镜像 (amd64/arm64)，托管于 GHCR |
| 文档 | VitePress |

## CI/CD

项目包含三个 GitHub Actions 工作流：

- **test.yml** — 推送时运行 Go 单元测试
- **docker.yml** — 构建并推送多架构 Docker 镜像 (linux/amd64, linux/arm64) 到 `ghcr.io`
- **pages.yml** — 将 VitePress 文档部署到 GitHub Pages

## 许可证

MIT
