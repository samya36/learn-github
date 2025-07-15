# 🚀 LearnGitHub 部署指南

## GitHub Token 配置（重要更新）

### 🔑 Token 过期时间建议

**生产环境推荐：无过期时间（No expiration）**
- ✅ 服务稳定性最高
- ✅ 维护成本最低
- ✅ 避免突然服务中断

**开发环境可选：30-90天**
- 🔄 定期更新提高安全性
- ⚠️ 需要定期维护

### 🔒 Token 权限设置（最小权限原则）

创建 GitHub Token 时，**只选择必要权限**：

```bash
✅ 必需权限：
- repo: public_repo （读取公开仓库）

❌ 不需要的权限：
- repo: repo （完整私有仓库访问）
- admin:org （组织管理）
- delete_repo （删除仓库）
- admin:public_key （SSH密钥管理）
```

### 🛡️ Token 安全管理

1. **环境变量存储**
```bash
# .env（本地开发）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Vercel环境变量（生产）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

2. **定期监控使用情况**
```bash
# GitHub 设置 → Developer settings → Personal access tokens
# 查看 Token 使用情况和权限
```

3. **备用 Token 策略**
```bash
# 建议准备2个Token轮换使用
GITHUB_TOKEN_PRIMARY=ghp_xxx...
GITHUB_TOKEN_BACKUP=ghp_xxx...
```

## 🌐 部署选项

### 1. Vercel 部署（推荐）

**优势**：自动部署、CDN 加速、简单配置

#### 步骤：
1. **连接 GitHub 仓库到 Vercel**
2. **配置环境变量**：
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
3. **自动部署**

#### Vercel 配置文件 (`vercel.json`)：
```json
{
  "name": "learngithub",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "GITHUB_TOKEN": "@github_token"
  }
}
```

### 2. Netlify 部署

#### 步骤：
1. **连接仓库到 Netlify**
2. **构建设置**：
   - 构建命令：`npm run build`
   - 发布目录：`.next`
3. **环境变量**：
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

### 3. Docker 部署

#### Dockerfile：
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 运行命令：
```bash
# 构建镜像
docker build -t learngithub .

# 运行容器
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=your_github_token_here \
  learngithub
```

### 4. 传统服务器部署

#### 安装 Node.js：
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 部署步骤：
```bash
# 1. 克隆项目
git clone your-repo-url
cd learngithub

# 2. 安装依赖
npm install

# 3. 构建应用
npm run build

# 4. 配置环境变量
export GITHUB_TOKEN=your_github_token_here

# 5. 启动应用
npm start

# 或使用 PM2 进程管理
npm install -g pm2
pm2 start npm --name "learngithub" -- start
```

## 🔧 环境变量配置

### 开发环境 (`.env`)
```bash
# GitHub API Token（必需）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 应用配置（可选）
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LearnGitHub
```

### 生产环境

根据部署平台设置环境变量：

#### Vercel
在项目设置的 Environment Variables 中添加：
```
GITHUB_TOKEN = your_token_here
```

#### Netlify
在 Site settings > Environment variables 中添加：
```
GITHUB_TOKEN = your_token_here
```

#### Heroku
```bash
heroku config:set GITHUB_TOKEN=your_token_here
```

#### Railway
在项目 Variables 中添加：
```
GITHUB_TOKEN = your_token_here
```

## 📊 性能优化建议

### 1. API 缓存
考虑添加 Redis 缓存来减少 GitHub API 调用：
```javascript
// 可选：添加缓存层
const cache = new Redis(process.env.REDIS_URL);
```

### 2. 请求限制
实现客户端请求限制防止滥用：
```javascript
// 可选：添加 rate limiting
import { rateLimit } from 'express-rate-limit';
```