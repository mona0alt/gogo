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
sed -i.bak "s/\"appid\": \"[^\"]*\"/\"appid\": \"$APP_ID\"/g" src/manifest.json && rm -f src/manifest.json.bak
echo "   - AppID: $APP_ID"

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🔧 构建微信小程序版本..."
npm run build:mp-weixin

echo ""
echo "📁 复制静态资源..."
# 输出目录
OUTPUT_DIR="dist/build/mp-weixin"

# 显式复制 static 目录（uni-app 构建可能遗漏新增的图片等资源）
for STATIC_SRC in "src/static" "static"; do
    if [ -d "$STATIC_SRC" ]; then
        mkdir -p "$OUTPUT_DIR/static"
        cp -R "$STATIC_SRC"/* "$OUTPUT_DIR/static/"
        echo "   - 已复制 $STATIC_SRC → $OUTPUT_DIR/static"
        break
    fi
done

echo ""
echo "☁️  配置云开发..."

# 复制云函数目录
if [ -d "cloudfunctions" ]; then
    rm -rf "$OUTPUT_DIR/cloudfunctions"
    cp -r cloudfunctions "$OUTPUT_DIR/cloudfunctions"
    echo "   - 已复制云函数目录"

    # 清理 macOS 资源分叉文件（如 .!95497!index.js、._index.js），避免微信开发者工具报错
    find "$OUTPUT_DIR/cloudfunctions" -type f \( -name '.!*' -o -name '._*' -o -name '.DS_Store' \) -delete
    echo "   - 已清理 macOS 资源分叉文件"

    # 将公共 utils 注入到每个云函数目录，避免云端 ../utils 路径失效
    UTILS_SRC="$OUTPUT_DIR/cloudfunctions/utils/index.js"
    if [ -f "$UTILS_SRC" ]; then
        for func_dir in "$OUTPUT_DIR"/cloudfunctions/*/; do
            func_name=$(basename "$func_dir")
            [ "$func_name" = "utils" ] && continue
            cp "$UTILS_SRC" "$func_dir/utils.js"
            # 替换 require('../utils') -> require('./utils')
            sed -i.bak "s|require('../utils')|require('./utils')|g" "$func_dir/index.js" && rm -f "$func_dir/index.js.bak"
        done
        echo "   - 已注入 utils 到各云函数"
    fi
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