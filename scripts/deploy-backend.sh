#!/usr/bin/env bash
# 服务器端后端部署脚本
# 由 GitHub Actions (appleboy/ssh-action) 在 push 到 main 后远程调用，也可在服务器上手动执行：
#   DEPLOY_REPO_ROOT=/opt/meetup-app bash scripts/deploy-backend.sh
#
# 流程：git fetch+reset → npm ci → nest build → pm2 restart
# 不做 git clean，避免误删服务器上的 .env 等未跟踪文件。

set -euo pipefail

# --- 环境变量（可选覆盖）---
REPO_ROOT="${DEPLOY_REPO_ROOT:-/opt/meetup-app}"
BACKEND_DIR="$REPO_ROOT/backend"
PM2_NAME="${PM2_NAME:-tripcircle-backend}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"

# --- 确保 node/npm/pm2 在 PATH（非交互 SSH 常缺失 nvm 路径）---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" 2>/dev/null || true
export PATH="/usr/local/bin:$PATH"

echo "==> [$REPO_ROOT] git fetch $GIT_REMOTE/$GIT_BRANCH"
cd "$REPO_ROOT"
git fetch --prune "$GIT_REMOTE" "$GIT_BRANCH"
git reset --hard "$GIT_REMOTE/$GIT_BRANCH"

echo "==> [$BACKEND_DIR] npm ci"
cd "$BACKEND_DIR"
npm ci

echo "==> nest build"
npm run build

echo "==> pm2 restart $PM2_NAME"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  # 首次部署时进程不存在，直接 start
  pm2 start dist/main.js --name "$PM2_NAME"
fi
pm2 save

echo "==> deploy done ✓"
