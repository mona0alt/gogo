#!/bin/bash

# 酒吧聚合平台小程序 - H5 构建脚本
# 用于本地预览，无需微信小程序开发工具

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  酒吧聚合平台 - H5 本地预览构建"
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
echo "🔧 构建 H5 版本..."
npm run build:h5

echo ""
echo "=========================================="
echo "  ✅ 构建完成!"
echo "=========================================="
echo ""
echo "📂 构建产物目录: dist/build/h5"
echo "🌐 局域网访问: http://你的IP:5173"
echo ""
echo "启动本地预览服务器..."
echo "=========================================="

# 启动 vite 内置服务器
npx vite --port 5173 --host
