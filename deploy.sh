#!/bin/bash

echo "🚀 一键部署戒断应用..."

# 停止并删除现有容器
echo "🛑 停止现有容器..."
docker stop jieduan 2>/dev/null || true
docker rm jieduan 2>/dev/null || true

# 构建新镜像
echo "🔨 构建应用..."
./build.sh

if [ $? -eq 0 ]; then
    # 启动新容器
    echo "🚀 启动应用..."
    docker run -d \
        --name jieduan \
        -p 1468:1468 \
        -v jieduan_data:/app/data \
        -e NEXTAUTH_SECRET="jieduan-secret-key-2024" \
        -e NEXTAUTH_URL="http://localhost:1468" \
        jieduan:latest

    if [ $? -eq 0 ]; then
        echo "✅ 部署成功！"
        echo "📱 访问地址: http://localhost:1468"
        echo "📊 查看日志: docker logs -f jieduan"
        echo "🔍 查看状态: docker ps | grep jieduan"
    else
        echo "❌ 启动失败！"
        exit 1
    fi
else
    echo "❌ 构建失败！"
    exit 1
fi
