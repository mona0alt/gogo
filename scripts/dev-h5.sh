#!/bin/bash

# 酒吧聚合平台小程序 - H5 开发预览脚本
# 启动热重载开发服务器，无需微信小程序开发工具

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  酒吧聚合平台 - H5 开发模式"
echo "=========================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🚀 启动开发服务器..."
echo "🌐 本地访问: http://localhost:5173"
echo "🌐 局域网访问: http://你的IP:5173"
echo "📝 按 Ctrl+C 停止服务器"
echo "=========================================="

npm run dev:h5
