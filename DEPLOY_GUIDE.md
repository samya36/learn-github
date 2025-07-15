# 🚀 LearnGitHub 部署指南

## 快速部署步骤

### 1. 准备工作
```bash
# 进入项目目录
cd /Users/xjy/Desktop/cursoruser/myapp/learn-github

# 检查项目是否正常
npm install
npm run build
npm run dev  # 测试本地运行
```

### 2. 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com) 并登录
2. 点击 "New repository"
3. 仓库名称：`learn-github`
4. 设置为 Public
5. 点击 "Create repository"

### 3. 推送代码到 GitHub
```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: LearnGitHub project"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/learn-github.git
git branch -M main
git push -u origin main
```

### 4. 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择刚创建的 `learn-github` 仓库
5. 点击 "Deploy"

### 5. 配置环境变量
1. 在 Vercel 项目页面，点击 "Settings"
2. 点击 "Environment Variables"
3. 添加环境变量：
   - **Name**: `GITHUB_TOKEN`
   - **Value**: 你的 GitHub token
   - **Environment**: 选择 Production、Preview、Development

### 6. 获取访问链接
部署完成后，你会看到类似这样的链接：
```
https://learn-github-username.vercel.app
```

## 📱 如何分享给别人

### 直接分享链接
```
嗨！我开发了一个 GitHub 学习助手工具，可以将任何 GitHub 仓库转换为学习路径。

🔗 访问链接：https://learn-github-username.vercel.app

功能特点：
✅ 智能语言检测
✅ 生成个性化学习任务
✅ 支持多语言项目
✅ 可视化语言分布
✅ 进度跟踪

试试分析你感兴趣的开源项目吧！
```

### 社交媒体分享
```
🚀 刚完成了一个开源项目学习工具！

LearnGitHub 可以：
• 分析任何 GitHub 仓库
• 生成循序渐进的学习路径
• 智能识别项目技术栈
• 提供个性化学习建议

在线体验：https://learn-github-username.vercel.app

#开源 #学习工具 #GitHub #NextJS
```

### 给开发者朋友
```
分享一个我做的开发工具：

LearnGitHub - GitHub 仓库学习助手
🔗 https://learn-github-username.vercel.app

特别适合：
• 想深入学习开源项目的开发者
• 需要快速了解新技术栈的团队
• 想系统学习大型项目的学生

试试分析 React、Vue 或者其他你感兴趣的项目！
```

## 🔧 高级配置

### 自定义域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

### 性能监控
1. 启用 Vercel Analytics
2. 监控访问量和性能指标
3. 优化用户体验

### 自动部署
- 每次推送到 GitHub 主分支时自动部署
- 支持预览部署（Pull Request）
- 回滚到之前的版本

## 🎯 使用示例

### 推荐测试项目
用户可以试试这些项目：
- https://github.com/vercel/next.js
- https://github.com/vuejs/vue
- https://github.com/microsoft/vscode
- https://github.com/tensorflow/tensorflow

### 功能演示
1. 输入 GitHub 仓库 URL
2. 点击"生成学习路径"
3. 查看项目分析结果
4. 管理学习任务
5. 跟踪学习进度