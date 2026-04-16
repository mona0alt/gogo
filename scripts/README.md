# H5 本地预览

无需安装微信小程序开发工具，直接在浏览器中预览效果。

## 快速开始

### macOS / Linux

```bash
# 进入项目目录
cd bar-platform-miniapp

# 安装依赖并启动开发服务器（推荐）
./scripts/dev-h5.sh

# 或者构建生产版本后预览
./scripts/build-h5.sh
```

### Windows

```bash
# 进入项目目录
cd bar-platform-miniapp

# 安装依赖并启动开发服务器
scripts\dev-h5.bat
```

## 预览地址

启动后访问: **http://localhost:5173**

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `dev-h5.sh` | 开发模式，热重载，修改代码自动刷新 |
| `build-h5.sh` | 生产构建，生成优化后的静态文件 |
| `dev-h5.bat` | Windows 用开发模式脚本 |

## 注意事项

1. H5 模式下部分微信特有 API（如微信登录、支付）无法使用
2. 页面路由基于浏览器环境，可能与小程序略有差异
3. 建议后续在微信开发工具中预览以获得完整体验
