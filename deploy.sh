#!/bin/bash

echo "🚀 开始部署 LearnGitHub 到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm install -g vercel"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🏗️  构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  警告: GITHUB_TOKEN 环境变量未设置"
    echo "请确保在 Vercel 中配置了 GITHUB_TOKEN"
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "🌐 访问你的应用：https://your-app.vercel.app"