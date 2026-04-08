# 快速开始

## 前置条件

- Docker 和 Docker Compose（推荐），或
- Go 1.25+（需 CGO 支持）

## Docker 快速启动

```bash
git clone https://github.com/XimilalaXiang/cloudflare-manager.git
cd cloudflare-manager
cp .env.example .env
# 编辑 .env 设置安全密钥
docker compose up -d
```

Web 界面地址：`http://localhost:8080`

## 首次使用

### 1. 登录
打开浏览器访问 `http://localhost:8080`，使用管理员凭据登录。

### 2. 修改默认密码
点击导航栏的 **密码** 按钮修改默认密码。

### 3. 添加 Cloudflare 账户
进入 **账户** → **添加账户**，填写：
- 显示名称
- Cloudflare 账户 ID
- Cloudflare API 令牌

令牌在存储前会通过 Cloudflare API 验证，并使用 AES-256-GCM 加密。

### 4. 开始管理
导航到 **Workers**、**域名**、**存储** 或 **路由** 管理你的 Cloudflare 资源。

## 获取 Cloudflare API 令牌

1. 前往 [Cloudflare 仪表盘 → API 令牌](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **创建令牌**
3. 选择合适的权限模板
4. 复制生成的令牌

::: tip
建议为每个用途创建最小权限的 API 令牌。
:::
