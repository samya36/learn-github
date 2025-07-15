# LearnGitHub - GitHub 学习助手

# 将 GitHub 仓库转换为个性化学习路径的 Web 应用。

## 功能特性

- 🔍 **智能语言检测**: 智能权重算法，过滤配置文件，准确识别主要编程语言
- 📚 **学习路径生成**: 根据项目特性生成循序渐进的学习任务
- 🎯 **多语言项目支持**: 自动识别并为多语言项目生成专属学习计划
- 📊 **语言分布可视化**: 直观显示项目各语言占比和分布
- 📱 **响应式设计**: 适配各种设备的现代化界面
- ⚡ **实时分析**: 快速获取仓库信息和生成学习任务

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **API**: GitHub REST API
- **部署**: Vercel (推荐)

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd learngithub
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量（重要！）

#### 开发环境
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加您的 GitHub token
GITHUB_TOKEN=your_github_token_here
```

#### 获取 GitHub Token
1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. **权限选择**: 
   - 对于公开仓库：无需任何权限
   - 对于私有仓库：选择 `repo` 权限
4. 复制生成的 token (格式: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 访问应用
打开 [http://localhost:3000](http://localhost:3000)

## 📊 API 限制说明

| 配置状态 | 每小时请求限制 | 适用场景 |
|---------|---------------|----------|
| 无 GitHub Token | 60 次 | 仅适合开发测试 |
| 有 GitHub Token | 5,000 次 | 生产环境必需 |

⚠️ **重要**: 生产部署必须配置 GitHub Token，否则会频繁遇到API限制。

## 🌐 部署指南

### Vercel 部署（推荐）

1. **连接 GitHub 仓库到 Vercel**
2. **配置环境变量**：
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
3. **部署**：
   ```bash
   npm run build
   vercel --prod
   ```

### Netlify 部署

1. **连接仓库到 Netlify**
2. **在 Site settings > Environment variables 中设置**：
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
3. **构建命令**: `npm run build`
4. **发布目录**: `out`

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建和运行
docker build -t learngithub .
docker run -p 3000:3000 -e GITHUB_TOKEN=your_token learngithub
```

### 自定义服务器部署

```bash
# 构建应用
npm run build

# 启动应用
GITHUB_TOKEN=your_token npm start
```

## 🔧 环境变量配置

创建 `.env` 文件（开发环境）或在部署平台设置以下变量：

```bash
# 必需 - GitHub API Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选 - 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=LearnGitHub
```

## 🎯 使用方法

1. **输入仓库 URL**: 在主页输入任何有效的 GitHub 仓库 URL
2. **生成学习路径**: 点击"生成学习路径"按钮
3. **查看分析结果**: 
   - **内容摘要** - 项目概览和语言分布
   - **操作计划** - 详细学习步骤
   - **任务列表** - 可交互的任务管理
4. **跟踪进度**: 勾选完成的任务，实时查看学习进度

## 🎨 功能亮点

### 智能语言检测
- ✅ 过滤配置文件（Dockerfile, JSON, YAML）
- ✅ 降低文档文件权重（Markdown, HTML）
- ✅ 智能识别多语言项目
- ✅ 语言分布可视化展示

### 个性化学习任务
- 📖 **阅读学习**: 理解项目结构、文档和代码
- 🛠️ **动手练习**: 环境配置、依赖安装
- 💻 **编码实践**: 修改代码、添加功能、解决 Issues
- 🌐 **多语言学习**: 针对多语言项目的专属任务

## 🧪 推荐测试项目

体验不同类型的项目分析：

### AI & 机器学习
- [OpenAI Gym](https://github.com/openai/gym) - 强化学习环境
- [Ray](https://github.com/ray-project/ray) - 分布式计算框架
- [Unity ML-Agents](https://github.com/Unity-Technologies/ml-agents) - 多语言AI项目
- [TensorFlow Agents](https://github.com/tensorflow/agents) - TensorFlow RL库

### 前端框架
- [Next.js](https://github.com/vercel/next.js) - React框架
- [Vue.js](https://github.com/vuejs/vue) - 渐进式框架
- [Svelte](https://github.com/sveltejs/svelte) - 编译型框架

### 系统工具
- [VS Code](https://github.com/microsoft/vscode) - 代码编辑器
- [Node.js](https://github.com/nodejs/node) - JavaScript运行时

## 🐛 常见问题

### Q: 遇到 "API 请求限制" 错误
**A**: 配置 GitHub Token 可解决此问题。未配置 token 时每小时只能请求60次。

### Q: 语言检测不准确
**A**: 新版本使用智能权重算法，自动过滤配置文件，提供更准确的语言识别。

### Q: 如何获取 GitHub Token？
**A**: 访问 [GitHub Settings](https://github.com/settings/tokens)，创建 Classic Token，无需任何权限即可用于公开仓库。

### Q: 支持私有仓库吗？
**A**: 支持，但需要在 GitHub Token 中授予 `repo` 权限。

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

⭐ 如果这个项目对您有帮助，请给个 Star！
