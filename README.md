# 戒断 - 个人戒断追踪应用

一个专注于隐私和简洁的个人戒断追踪网站，支持暗色/浅色主题切换，内嵌SQLite数据库，并可编译为Docker容器。

## 🚀 特性

- 📅 **日历视图** - 直观显示成功日和复发日
- 🌓 **主题切换** - 支持暗色和浅色模式
- 📊 **戒断统计** - 实时显示当前戒断天数
- 📝 **日志功能** - 记录每日想法和感受
- 📈 **复发追踪** - 记录和分析复发模式
- 💾 **内嵌数据库** - SQLite数据库，无需外部依赖
- 🐳 **Docker支持** - 一键部署到任何服务器
- 📱 **移动优先** - 完全响应式设计
- 🎨 **现代UI** - 玻璃拟态、渐变色彩、新拟物化设计

## 🐳 Docker 部署

### 方法1：使用预构建镜像（推荐）

\`\`\`bash
# 拉取最新镜像
docker pull ghcr.io/yourusername/jieduan:latest

# 运行容器
docker run -d \
  --name jieduan \
  -p 1468:1468 \
  -v jieduan_data:/app/data \
  -e NEXTAUTH_SECRET="your-secret-key" \
  ghcr.io/yourusername/jieduan:latest

# 访问应用
open http://localhost:1468
\`\`\`

### 方法2：使用Docker Compose

\`\`\`bash
# 克隆项目
git clone https://github.com/yourusername/jieduan.git
cd jieduan

# 创建环境变量文件
cp .env.example .env

# 启动服务
docker-compose up -d

# 访问应用
open http://localhost:1468
\`\`\`

### 方法3：本地构建

\`\`\`bash
# 构建镜像
docker build -t jieduan .

# 运行容器
docker run -d \
  --name jieduan \
  -p 1468:1468 \
  -v jieduan_data:/app/data \
  jieduan
\`\`\`

## 🔧 配置

### 环境变量

- `NEXTAUTH_SECRET`: 应用密钥（必需）
- `NEXTAUTH_URL`: 应用访问地址（默认: http://localhost:1468）
- `DATABASE_URL`: 数据库路径（默认: file:/app/data/recovery.db）

### 数据持久化

应用使用SQLite数据库，数据存储在 `/app/data` 目录中。使用Docker Volume确保数据持久化：

\`\`\`bash
# 创建命名卷
docker volume create jieduan_data

# 备份数据
docker run --rm -v jieduan_data:/data -v $(pwd):/backup alpine tar czf /backup/jieduan-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v jieduan_data:/data -v $(pwd):/backup alpine tar xzf /backup/jieduan-backup.tar.gz -C /data
\`\`\`

## 🛠️ 开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
\`\`\`

## 📊 数据库结构

应用使用SQLite数据库，包含以下表：

- `recovery_data`: 戒断开始日期和统计
- `journal_entries`: 日志条目
- `relapse_records`: 复发记录

## 🔒 隐私和安全

- ✅ 数据存储在本地SQLite数据库中
- ✅ 支持私有服务器部署
- ✅ 无第三方数据收集
- ✅ 完全离线运行能力
- ✅ 数据加密存储选项

## 🌐 部署到生产环境

### 使用GitHub Actions自动构建

1. Fork此项目到您的GitHub账户
2. 推送代码到main分支
3. GitHub Actions会自动构建Docker镜像
4. 镜像会推送到GitHub Container Registry

### 部署到服务器

\`\`\`bash
# 在服务器上拉取镜像
docker pull ghcr.io/yourusername/jieduan:latest

# 使用反向代理（Nginx）
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:1468;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## 📱 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: SQLite (better-sqlite3)
- **部署**: Docker, GitHub Actions
- **主题**: next-themes

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
