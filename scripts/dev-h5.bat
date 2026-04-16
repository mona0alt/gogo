@echo off
REM 酒吧聚合平台小程序 - H5 开发预览脚本 (Windows)

echo ==========================================
echo   酒吧聚合平台 - H5 开发模式
echo ==========================================

cd /d "%~dp0.."

echo.
echo 📦 安装依赖...
call npm install

echo.
echo 🚀 启动开发服务器...
echo 🌐 访问地址: http://localhost:5173
echo 📝 按 Ctrl+C 停止服务器
echo ==========================================

call npm run dev:h5
