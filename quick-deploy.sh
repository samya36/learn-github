#!/bin/bash

echo "🚀 LearnGitHub 快速部署脚本"
echo "================================"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 安装 Vercel CLI（如果未安装）
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 构建项目
echo "🏗️  构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查代码"
    exit 1
fi

# 登录 Vercel
echo "🔐 登录 Vercel..."
vercel login

# 部署项目
echo "🚀 部署项目..."
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 访问 https://vercel.com/dashboard"
echo "2. 找到你的项目"
echo "3. 点击项目名称"
echo "4. 复制 URL 分享给别人"
echo ""
echo "🔧 记得配置环境变量："
echo "- 在 Vercel 项目设置中添加 GITHUB_TOKEN"
echo "- 获取 Token: https://github.com/settings/tokens"
echo ""
echo "🎉 你的 LearnGitHub 应用现在已经上线了！"