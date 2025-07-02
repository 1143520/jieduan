#!/bin/bash

echo "🚀 开始构建戒断应用..."

# 检查是否存在package-lock.json
if [ ! -f "package-lock.json" ]; then
    echo "📦 生成package-lock.json..."
    npm install --package-lock-only --legacy-peer-deps
fi

# 构建Docker镜像
echo "🐳 构建Docker镜像..."
docker build -f Dockerfile.simple -t jieduan:latest .

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "🎯 运行以下命令启动应用："
    echo "docker run -d --name jieduan -p 1468:1468 -v jieduan_data:/app/data jieduan:latest"
    echo "📱 访问地址: http://localhost:1468"
else
    echo "❌ 构建失败！"
    exit 1
fi
