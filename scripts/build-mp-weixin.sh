#!/bin/bash

# 酒吧聚合平台小程序 - 微信小程序构建脚本
# 构建后需使用微信开发者工具打开项目

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  酒吧聚合平台 - 微信小程序构建"
echo "=========================================="

# ========== 配置区域 ==========
# 请在此处填写正确的配置信息
APP_ID="wxea6875f5c19de652"
CLOUD_ENV_ID="cloud1-d3gjrsyla8bdd9f4a"
# ===========================================

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo ""
echo "📝 更新配置文件..."
# 更新 manifest.json 中的 appid
sed -i "s/\"appid\": \"[^\"]*\"/\"appid\": \"$APP_ID\"/g" src/manifest.json
echo "   - AppID: $APP_ID"

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🔧 构建微信小程序版本..."
npm run build:mp-weixin

echo ""
echo "☁️  配置云开发..."
# 输出目录
OUTPUT_DIR="dist/build/mp-weixin"

# 复制云函数目录
if [ -d "cloudfunctions" ]; then
    rm -rf "$OUTPUT_DIR/cloudfunctions"
    cp -r cloudfunctions "$OUTPUT_DIR/cloudfunctions"
    echo "   - 已复制云函数目录"
fi

# 更新 project.config.json 配置云开发
PROJECT_CONFIG="$OUTPUT_DIR/project.config.json"
if [ -f "$PROJECT_CONFIG" ]; then
    # 添加云开发配置
    # 使用 python3 处理 JSON 更可靠
    python3 << EOF
import json

with open('$PROJECT_CONFIG', 'r', encoding='utf-8') as f:
    config = json.load(f)

# 添加云开发配置
config['cloudfunctionRoot'] = 'cloudfunctions/'
config['cloudbase'] = {
    'tcbEnv': '$CLOUD_ENV_ID',
    'tcbAppId': '$APP_ID'
}

# 确保 compileType 是 miniprogram
config['compileType'] = 'miniprogram'

# 确保 miniprogramRoot 正确
if 'miniprogramRoot' not in config:
    config['miniprogramRoot'] = ''

with open('$PROJECT_CONFIG', 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print("   - 已配置云开发环境: $CLOUD_ENV_ID")
EOF
fi

echo ""
echo "=========================================="
echo "  ✅ 构建完成!"
echo "=========================================="
echo ""
echo "📂 构建产物目录: $OUTPUT_DIR"
echo "☁️  云环境 ID: $CLOUD_ENV_ID"
echo ""
echo "请使用微信开发者工具打开上述目录进行预览和发布"
echo "首次打开时，开发者工具会提示配置云开发环境，选择上述环境即可"
echo "=========================================="