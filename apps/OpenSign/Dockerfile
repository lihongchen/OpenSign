# 构建阶段
FROM node:22 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set -g registry http://registry.npmmirror.com
RUN npm install
COPY . .
RUN npm run build
# 使用 Caddy 作为静态文件服务器
FROM caddy:alpine

# 复制构建的静态文件到 /srv
COPY --from=build /app/build /srv

# 配置 Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
