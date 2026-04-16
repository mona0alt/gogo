#!/bin/bash

# 酒吧聚合平台小程序 - 微信小程序构建脚本
# 构建后需使用微信开发者工具打开项目

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  酒吧聚合平台 - 微信小程序构建"
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
echo "🔧 构建微信小程序版本..."
npm run build:mp-weixin

echo ""
echo "=========================================="
echo "  ✅ 构建完成!"
echo "=========================================="
echo ""
echo "📂 构建产物目录: dist/build/mp-weixin"
echo ""
echo "请使用微信开发者工具打开上述目录进行预览和发布"
echo "微信开发者工具下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
echo "=========================================="
