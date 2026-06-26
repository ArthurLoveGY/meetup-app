# TripCircle 云端部署 & 本地联调指南

> **目标**：将后端部署到云服务器，前端在本地开发环境中调用远程后端 API 进行测试。

---

## 目录

1. [架构概览](#1-架构概览)
2. [前置准备](#2-前置准备)
3. [云服务器环境配置](#3-云服务器环境配置)
4. [后端部署](#4-后端部署)
5. [前端连接远程后端](#5-前端连接远程后端)
6. [本地联调测试](#6-本地联调测试)
7. [常见问题](#7-常见问题)

---

## 1. 架构概览

```
┌──────────────────┐          ┌─────────────────────────────┐
│  本地开发环境     │          │  云服务器 (Ubuntu/CentOS)    │
│                  │   HTTP   │                             │
│  Taro 前端       │ ───────► │  NestJS 后端 (:3000)        │
│  (H5/小程序/RN)  │          │  PostgreSQL  (:5432)        │
│                  │          │  uploads/ (静态文件)          │
└──────────────────┘          └─────────────────────────────┘
```

**技术栈**：

| 层级 | 技术 |
|------|------|
| 前端 | Taro 4.x + React + TypeScript |
| 后端 | NestJS 10 + TypeORM + Socket.IO |
| 数据库 | PostgreSQL 14+ |
| 认证 | JWT (Bearer Token) |
| 文件存储 | 本地磁盘 (`uploads/`) |

---

## 2. 前置准备

### 2.1 云服务器要求

- **操作系统**：Ubuntu 22.04 LTS（推荐）/ CentOS 7+ / Debian 11+
- **最低配置**：1 核 CPU / 1GB 内存 / 20GB 磁盘
- **公网 IP**：确保有可访问的公网 IP 或域名
- **开放端口**：`3000`（后端 API）、`22`（SSH）、`5432`（如需远程连接数据库）

### 2.2 本地环境

- Node.js >= 18.x
- npm / yarn / pnpm
- Git

---

## 3. 云服务器环境配置

### 3.1 SSH 登录服务器

```bash
ssh root@<你的服务器IP>
```

### 3.2 安装 Node.js (v18+)

```bash
# 使用 NodeSource 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 3.3 安装 PostgreSQL

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# 启动并设为开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.4 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

-- 在 psql 中执行：
CREATE USER tripcircle WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE tripcircle OWNER tripcircle;
GRANT ALL PRIVILEGES ON DATABASE tripcircle TO tripcircle;
\q
```

### 3.5 配置 PostgreSQL 远程访问（可选）

如果需要从本地直接连接数据库进行调试：

```bash
# 编辑 pg_hba.conf，添加允许远程连接
sudo vim /etc/postgresql/14/main/pg_hba.conf
# 在文件末尾添加：
# host    tripcircle    tripcircle    0.0.0.0/0    md5

# 编辑 postgresql.conf，监听所有地址
sudo vim /etc/postgresql/14/main/postgresql.conf
# 将 listen_addresses = 'localhost' 改为：
# listen_addresses = '*'

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

> ⚠️ 生产环境建议限制来源 IP，不要使用 `0.0.0.0/0`。

---

## 4. 后端部署

### 4.1 上传项目代码

**方式一：Git（推荐）**

```bash
# 在服务器上克隆项目
cd /opt
git clone <你的仓库地址> trip-circle
cd trip-circle/backend
```

**方式二：scp 上传**

```bash
# 在本地执行
scp -r ./backend root@<服务器IP>:/opt/trip-circle/backend
```

### 4.2 安装依赖

```bash
cd /opt/trip-circle/backend
npm install
```

### 4.3 配置环境变量

创建 `.env` 文件：

```bash
cat > .env << 'EOF'
# ===== 服务配置 =====
PORT=3000
NODE_ENV=production

# ===== 数据库配置 =====
DB_HOST=localhost
DB_PORT=5432
DB_USER=tripcircle
DB_PASS=your_secure_password_here
DB_NAME=tripcircle

# ===== JWT 密钥（必须修改！） =====
JWT_SECRET=your-random-jwt-secret-at-least-32-chars

# ===== 微信登录（如需） =====
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
EOF
```

> ⚠️ `JWT_SECRET` 必须设置，生产环境下不设置会直接报错退出。建议使用随机字符串：
> ```bash
> openssl rand -hex 32
> ```

### 4.4 构建项目

```bash
npm run build
```

### 4.5 使用 PM2 进程管理（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/main.js --name tripcircle-backend

# 设置开机自启
pm2 save
pm2 startup

# 常用命令
pm2 status          # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启
pm2 stop all        # 停止
```

### 4.6 使用 systemd 管理（替代方案）

```bash
cat > /etc/systemd/system/tripcircle.service << 'EOF'
[Unit]
Description=TripCircle Backend
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/trip-circle/backend
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/opt/trip-circle/backend/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tripcircle
sudo systemctl start tripcircle
sudo systemctl status tripcircle
```

### 4.7 配置 Nginx 反向代理（推荐）

```bash
sudo apt-get install -y nginx
```

```nginx
# /etc/nginx/sites-available/tripcircle
server {
    listen 80;
    server_name your-domain.com;  # 或服务器 IP

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理（聊天功能）
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态文件（上传的图片等）
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/tripcircle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.8 验证后端部署

```bash
# 在服务器本地测试
curl http://localhost:3000/api/auth/me

# 从本地机器测试（替换为你的服务器 IP）
curl http://<服务器IP>:3000/api/auth/me
```

应返回类似 `{"code":401,"message":"Unauthorized"}` 的响应，说明服务已正常运行。

---

## 5. 前端连接远程后端

### 5.1 修改 API 地址

编辑 [src/services/request.ts](../src/services/request.ts)，将 `BASE_URL` 指向你的云服务器：

```typescript
// 将原来的：
const BASE_URL = 'http://127.0.0.1:3000/api'

// 改为你的服务器地址（二选一）：

// 方式 A：直接指向后端端口
const BASE_URL = 'http://<服务器IP>:3000/api'

// 方式 B：通过 Nginx 反向代理（推荐，端口 80）
const BASE_URL = 'http://<服务器IP>/api'
```

### 5.2 修改 WebSocket 地址

如果项目使用了 Socket.IO 聊天功能，检查 [src/services/socket.ts](../src/services/socket.ts) 中的 WebSocket 连接地址，同样需要更新为服务器地址。

### 5.3 配置 CORS 白名单

如果前端运行在不同端口（如 H5 模式默认 `http://localhost:10086`），需要在 [backend/src/main.ts](../backend/src/main.ts) 的 `origin` 数组中添加对应地址：

```typescript
app.enableCors({
  origin: [
    'http://localhost:10086',
    'https://servicewechat.com',
    // 添加你本地 H5 开发端口（如果不是 10086）
    'http://localhost:xxxx',
  ],
  credentials: true,
})
```

> 修改后需重新构建并部署后端。

---

## 6. 本地联调测试

### 6.1 启动前端开发服务器

```bash
# 回到项目根目录
cd /Users/arthurzhang/Project/meetup-app

# H5 模式（浏览器调试，推荐先用这个）
npm run dev:h5

# 微信小程序模式
npm run dev:weapp

# React Native 模式
npm run dev:rn
```

### 6.2 验证 API 连通性

浏览器打开前端页面后，打开 DevTools → Network 面板，观察请求是否正确发往服务器：

```
请求地址应为: http://<服务器IP>/api/auth/xxx
状态码: 200 / 401 等（非 net::ERR_CONNECTION_REFUSED 即可）
```

### 6.3 测试登录流程

由于后端使用了 mock 微信登录和短信验证码（开发模式），可以这样测试：

**手机号登录测试：**

1. 调用发送验证码接口（后端控制台会打印验证码）：
   ```bash
   curl -X POST http://<服务器IP>/api/auth/phone-login \
     -H "Content-Type: application/json" \
     -d '{"phone":"13800138000","code":"查看服务器日志中的6位数验证码"}'
   ```

2. 或者查看 PM2 日志获取验证码：
   ```bash
   pm2 logs tripcircle-backend
   # 会看到: [dev] SMS code for 13800138000: 123456
   ```

**微信登录测试：**

```bash
curl -X POST http://<服务器IP>/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code_123"}'
```

### 6.4 测试已认证接口

拿到 token 后，测试需要认证的接口：

```bash
# 替换 <TOKEN> 为登录返回的 token
curl http://<服务器IP>/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 7. 常见问题

### Q1: 请求报 `net::ERR_CONNECTION_REFUSED`

- 检查服务器防火墙是否放行了 `3000` 端口：
  ```bash
  # Ubuntu/Debian
  sudo ufw allow 3000/tcp

  # CentOS
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --reload
  ```
- 检查云服务商安全组规则，确保入站规则允许 `3000` 端口（阿里云/腾讯云/AWS 等）

### Q2: 请求报 CORS 错误

- 确保后端 `main.ts` 中的 `origin` 包含了前端的实际地址
- 修改后需要重新构建部署后端

### Q3: 数据库连接失败

- 检查 `.env` 中数据库配置是否正确
- 确认 PostgreSQL 服务正在运行：`sudo systemctl status postgresql`
- 测试连接：`psql -h localhost -U tripcircle -d tripcircle`

### Q4: 上传文件无法访问

- 确保 `uploads/` 目录存在且有写入权限
- 确保 Nginx 正确代理了 `/uploads/` 路径
- 如果直接访问后端端口，确认 `ServeStaticModule` 配置正确

### Q5: WebSocket 连接失败

- 确保 Nginx 配置中包含了 `/socket.io/` 的 WebSocket 升级代理
- 检查浏览器控制台是否有 WebSocket 握手错误

### Q6: H5 模式页面空白

- 确保 `npm run dev:h5` 构建成功
- 检查终端是否有编译错误
- 清除浏览器缓存后重试

---

## 附录：快速部署检查清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 云服务器已安装 Node.js 18+ | ☐ |
| 2 | PostgreSQL 已安装并创建好数据库 | ☐ |
| 3 | 后端 `.env` 文件已配置（特别是 `JWT_SECRET`） | ☐ |
| 4 | 后端 `npm run build` 构建成功 | ☐ |
| 5 | PM2 启动后端服务正常 | ☐ |
| 6 | 服务器防火墙/安全组已放行端口 | ☐ |
| 7 | 前端 `BASE_URL` 已改为服务器地址 | ☐ |
| 8 | 后端 CORS `origin` 已包含前端地址 | ☐ |
| 9 | `curl` 测试 API 返回正常 | ☐ |
| 10 | 前端 `npm run dev:h5` 能正常联调 | ☐ |

---

## 8. 自动部署（GitHub Actions + SSH）

> push 到 `main` 分支后，GitHub Actions 通过 SSH 登录服务器，自动执行 `git pull → npm ci → nest build → pm2 restart`，无需手动登录服务器。

### 8.1 工作机制

- 触发条件：push 到 `main` 且 `backend/`、`scripts/deploy-backend.sh`、`.github/workflows/deploy-backend.yml` 任一变更；也支持在 GitHub 仓库 **Actions** 页面手动触发（`workflow_dispatch`）。
- 执行文件：`scripts/deploy-backend.sh`（服务器端运行，幂等，可手动执行）。
- 并发控制：同一时刻只允许一个部署任务，避免并发构建互相覆盖。
- 纯前端提交不会触发后端部署（靠 `paths` 过滤）。

### 8.2 在 GitHub 仓库配置 Secrets

进入仓库 **Settings → Secrets and variables → Actions → New repository secret**，添加：

| Secret 名 | 说明 | 示例 |
|-----------|------|------|
| `SSH_HOST` | 服务器公网 IP | `106.53.52.88` |
| `SSH_USER` | SSH 登录用户 | `root` 或独立 deploy 用户 |
| `SSH_KEY` | SSH 私钥（OpenSSH 格式，含 `-----BEGIN ... PRIVATE KEY-----`） | （见 8.3 生成） |
| `SSH_PORT` | SSH 端口，默认 22 | `22` |
| `DEPLOY_REPO_ROOT` | 服务器上仓库根目录（可选，默认 `/opt/meetup-app`） | `/opt/meetup-app` |

> 仓库为 public，服务器 `git fetch` 无需额外凭证；若后续转为 private，需在服务器配置 deploy key 或 PAT。

### 8.3 生成部署专用 SSH 密钥

在本机生成一对专用密钥（不要复用个人密钥）：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
```

- 把**公钥** `~/.ssh/github_actions_deploy.pub` 追加到服务器对应用户的 `~/.ssh/authorized_keys`：
  ```bash
  ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@106.53.52.88
  ```
- 把**私钥** `~/.ssh/github_actions_deploy` 的完整内容粘贴到 GitHub Secret `SSH_KEY`。

建议对 deploy 公钥在 `authorized_keys` 中限制可执行的命令，降低风险，例如：
```
from="GitHub Actions 的网段",command="bash scripts/deploy-backend.sh",no-port-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA...
```
（实际网段需参考 [GitHub Actions IP ranges](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-githubs-ip-addresses)；若不便维护可省略 `from=`，但务必保留 `command=` 与 `no-pty`。）

### 8.4 服务器侧一次性准备

确保服务器上：

1. 已 `git clone` 仓库到 `$DEPLOY_REPO_ROOT`（默认 `/opt/meetup-app`），并切到 `main`：
   ```bash
   git clone https://github.com/ArthurLoveGY/meetup-app.git /opt/meetup-app
   cd /opt/meetup-app && git checkout main
   ```
2. 后端 `.env` 已在 `/opt/meetup-app/backend/.env` 配置好（`JWT_SECRET`、数据库连接等）。`.env` 在 `.gitignore` 中，部署脚本不会动它。
3. 已全局安装 `pm2`：`npm install -g pm2`，并执行过 `pm2 startup` + `pm2 install pm2-logrotate`（可选）。
4. 首次部署若 pm2 进程不存在，脚本会自动 `pm2 start dist/main.js --name tripcircle-backend`；之后用 `pm2 restart`。

### 8.5 验证

1. 推送一次 backend 改动到 `main`，或在 Actions 页面点 **Run workflow**。
2. 在仓库 **Actions** 标签页查看 `deploy-backend` 运行状态，全绿即成功。
3. 服务器上检查：
   ```bash
   pm2 status                 # tripcircle-backend 状态应为 online
   pm2 logs tripcircle-backend --lines 50
   curl https://api.arthurzhang.top/api/health  # 或任意已有路由
   ```

### 8.6 手动部署 / 排错

脚本本身可在服务器上直接跑，与 CI 完全一致：

```bash
cd /opt/meetup-app
bash scripts/deploy-backend.sh
# 或指定变量
DEPLOY_REPO_ROOT=/opt/meetup-app PM2_NAME=tripcircle-backend bash scripts/deploy-backend.sh
```

常见问题：

- **SSH 连接失败**：确认 `SSH_HOST/USER/PORT/KEY` 正确，私钥格式为 OpenSSH，服务器 `authorized_keys` 已加公钥。
- **`pm2: command not found`**：脚本会尝试 source nvm；若服务器用其他方式装 node，确保 `pm2` 在非交互 SSH 的 `PATH` 中（脚本已加 `/usr/local/bin`）。
- **`npm ci` 失败**：通常是 `package-lock.json` 与依赖不一致，本地跑 `npm install` 重新生成 lock 并提交。
- **构建成功但接口 500**：看 `pm2 logs`；多为 `.env` 缺字段或数据库连接问题。
- **部署把 .env 删了？** 不会。脚本只 `git reset --hard`（不碰未跟踪文件），从不 `git clean`。

