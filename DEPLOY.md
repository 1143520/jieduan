# 🚀 部署指南

## 快速部署

### 方法1：一键部署脚本（推荐）

\`\`\`bash
# 给脚本执行权限
chmod +x build.sh deploy.sh

# 一键部署
./deploy.sh
\`\`\`

### 方法2：使用简化的Docker Compose

\`\`\`bash
# 使用简化版本
docker-compose -f docker-compose.simple.yml up -d

# 查看日志
docker-compose -f docker-compose.simple.yml logs -f
\`\`\`

### 方法3：手动构建

\`\`\`bash
# 1. 生成package-lock.json（如果没有）
npm install --package-lock-only

# 2. 构建镜像
docker build -f Dockerfile.simple -t jieduan .

# 3. 运行容器
docker run -d \
  --name jieduan \
  -p 1468:1468 \
  -v jieduan_data:/app/data \
  -e NEXTAUTH_SECRET="your-secret-key" \
  jieduan:latest
\`\`\`

## 故障排除

### 常见问题

1. **构建失败 - 缺少锁文件**
   \`\`\`bash
   # 生成package-lock.json
   npm install --package-lock-only
   \`\`\`

2. **端口被占用**
   \`\`\`bash
   # 查看端口占用
   lsof -i :1468
   # 或者使用其他端口
   docker run -p 1469:1468 jieduan:latest
   \`\`\`

3. **数据库初始化失败**
   \`\`\`bash
   # 手动初始化数据库
   docker exec -it jieduan sqlite3 /app/data/recovery.db < /app/scripts/init-sqlite.sql
   \`\`\`

4. **查看详细日志**
   \`\`\`bash
   docker logs -f jieduan
   \`\`\`

### 数据管理

\`\`\`bash
# 备份数据
docker run --rm -v jieduan_data:/data -v $(pwd):/backup alpine tar czf /backup/jieduan-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v jieduan_data:/data -v $(pwd):/backup alpine tar xzf /backup/jieduan-backup.tar.gz -C /data

# 查看数据库
docker exec -it jieduan sqlite3 /app/data/recovery.db ".tables"
\`\`\`

## 生产环境部署

### 使用反向代理

\`\`\`nginx
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

### 环境变量配置

\`\`\`bash
# 生产环境
docker run -d \
  --name jieduan \
  -p 1468:1468 \
  -v jieduan_data:/app/data \
  -e NEXTAUTH_SECRET="your-production-secret-key" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  --restart unless-stopped \
  jieduan:latest
\`\`\`
