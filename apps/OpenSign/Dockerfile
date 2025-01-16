# 构建阶段
FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set -g registry http://registry.npmmirror.com
RUN npm install
COPY . .
EXPOSE 3000

# Run the application
ENTRYPOINT npm start