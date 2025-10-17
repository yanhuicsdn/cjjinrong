# 🚀 部署指南

## 部署到 Vercel (推荐)

Vercel 是 Next.js 的官方部署平台,部署最简单。

### 步骤

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **连接 GitHub 仓库**
   ```bash
   # 在项目目录下
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **导入项目到 Vercel**
   - 在 Vercel 控制台点击 "New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy"

4. **完成!**
   - 部署完成后会得到一个 `.vercel.app` 域名
   - 每次 push 到 GitHub 都会自动部署

### 自定义域名

1. 在 Vercel 项目设置中添加域名
2. 在域名提供商处添加 DNS 记录
3. 等待 DNS 生效

## 部署到 Netlify

### 步骤

1. **注册 Netlify 账号**
   - 访问 [netlify.com](https://netlify.com)

2. **连接 GitHub 仓库**
   - 点击 "New site from Git"
   - 选择 GitHub 仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **部署**
   - 点击 "Deploy site"

## 部署到自己的服务器

### 使用 Docker

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/next.config.ts ./
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **构建镜像**
   ```bash
   docker build -t market-bubble-tracker .
   ```

3. **运行容器**
   ```bash
   docker run -p 3000:3000 market-bubble-tracker
   ```

### 使用 PM2

1. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **启动应用**
   ```bash
   pm2 start npm --name "market-tracker" -- start
   ```

4. **设置开机自启**
   ```bash
   pm2 startup
   pm2 save
   ```

### 使用 Nginx 反向代理

1. **Nginx 配置**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **重启 Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 性能优化

### 1. 启用缓存

在 `next.config.ts` 中配置:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};
```

### 2. 使用 CDN

- 将静态资源上传到 CDN
- 配置 `next.config.ts` 的 `assetPrefix`

### 3. 数据缓存

考虑使用 Redis 缓存 API 数据:
```typescript
// 伪代码
const cachedData = await redis.get('market-data');
if (cachedData) {
  return cachedData;
}
const freshData = await fetchYahooFinance();
await redis.set('market-data', freshData, 'EX', 300); // 5分钟缓存
```

## 监控和维护

### 1. 错误监控

使用 Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 2. 性能监控

- Vercel Analytics (如果部署在 Vercel)
- Google Analytics
- Plausible Analytics

### 3. 日志

使用 Winston 或 Pino 记录日志:
```bash
npm install winston
```

## 环境变量

如果需要配置环境变量:

1. **本地开发**: 创建 `.env.local`
2. **Vercel**: 在项目设置中添加环境变量
3. **Docker**: 使用 `-e` 参数或 `.env` 文件

## 备份策略

1. **代码备份**: GitHub 自动备份
2. **数据备份**: 如果添加了数据库,定期备份
3. **配置备份**: 保存环境变量和配置文件

## 更新流程

1. **开发新功能**
   ```bash
   git checkout -b feature/new-feature
   # 开发...
   git commit -m "Add new feature"
   ```

2. **测试**
   ```bash
   npm run build
   npm start
   # 测试功能
   ```

3. **合并和部署**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   # Vercel 自动部署
   ```

## 故障排查

### API 请求失败
- 检查 Yahoo Finance API 是否可访问
- 查看浏览器控制台错误
- 检查服务器日志

### 构建失败
- 清除缓存: `rm -rf .next`
- 重新安装依赖: `rm -rf node_modules && npm install`
- 检查 Node.js 版本 (需要 18+)

### 性能问题
- 检查 API 响应时间
- 考虑添加缓存
- 优化图表渲染

## 成本估算

### Vercel (推荐)
- **Hobby 计划**: 免费
  - 100GB 带宽/月
  - 无限请求
  - 适合个人使用

- **Pro 计划**: $20/月
  - 1TB 带宽
  - 更好的性能
  - 适合生产环境

### 自建服务器
- **VPS**: $5-20/月
  - DigitalOcean, Linode, Vultr
  - 需要自己维护

- **域名**: $10-15/年

## 安全建议

1. **HTTPS**: 必须启用 SSL
2. **API 限流**: 防止滥用
3. **CORS**: 配置正确的跨域策略
4. **依赖更新**: 定期更新依赖包
5. **安全头**: 配置安全相关的 HTTP 头

## 推荐配置

对于个人使用:
- ✅ Vercel Hobby (免费)
- ✅ 自定义域名 (可选)
- ✅ Vercel Analytics (免费)

对于商业使用:
- ✅ Vercel Pro
- ✅ 自定义域名
- ✅ Sentry 错误监控
- ✅ Redis 缓存
- ✅ CDN 加速

---

有问题? 查看 [Next.js 部署文档](https://nextjs.org/docs/deployment)
