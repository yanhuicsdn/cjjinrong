# 🔧 故障排除指南

## 常见问题和解决方案

### 1. 构建错误: Module not found (字体相关)

**错误信息:**
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

**原因:** Next.js 15 使用 Turbopack 时的字体加载问题

**解决方案:**
已在 `app/layout.tsx` 中移除 Geist 字体,使用系统字体。如果仍有问题:

```bash
# 清除缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新启动
npm run dev
```

### 2. TypeScript 错误: 找不到模块

**错误信息:**
```
找不到模块"./RatioChart"或其相应的类型声明
```

**原因:** TypeScript 编译器尚未识别新创建的文件

**解决方案:**
1. 等待 TypeScript 服务器重启(通常自动)
2. 或在 VSCode 中: `Cmd+Shift+P` -> "TypeScript: Restart TS Server"
3. 或重启开发服务器

### 3. 开发服务器无法启动

**可能原因和解决方案:**

#### 端口被占用
```bash
# 查找占用3000端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用其他端口
PORT=3001 npm run dev
```

#### Node.js 版本过低
```bash
# 检查版本(需要 18+)
node -v

# 升级 Node.js
# 访问 https://nodejs.org/ 下载最新版本
```

#### 依赖问题
```bash
# 删除并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 4. API 请求失败

**错误信息:** "Failed to fetch market data"

**可能原因:**

#### Yahoo Finance API 不可访问
- 检查网络连接
- 尝试访问: https://query1.finance.yahoo.com/v8/finance/chart/^GSPC?range=1d
- 如果被墙,可能需要代理

#### CORS 问题
- 开发环境应该不会有 CORS 问题
- 如果部署后出现,检查 API Routes 配置

**解决方案:**
```typescript
// 在 API route 中添加 CORS 头
export async function GET(request: Request) {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

### 5. 图表不显示

**可能原因:**

#### 数据格式问题
- 检查浏览器控制台是否有错误
- 确认 API 返回的数据格式正确

#### Recharts 加载问题
```bash
# 重新安装 recharts
npm uninstall recharts
npm install recharts
```

### 6. 样式问题

#### TailwindCSS 不生效
```bash
# 重新构建
rm -rf .next
npm run dev
```

#### 深色模式问题
- 检查系统设置
- 或在代码中强制设置:
```html
<html lang="zh-CN" class="dark">
```

### 7. 部署问题

#### Vercel 部署失败

**构建超时:**
- 检查依赖是否过大
- 考虑使用 `npm ci` 代替 `npm install`

**环境变量:**
- 确保在 Vercel 设置中添加了所需的环境变量
- 注意: 本项目不需要环境变量

**构建命令:**
```bash
# 确保使用正确的构建命令
npm run build
```

#### 自定义域名不生效
- 检查 DNS 设置
- 等待 DNS 传播(可能需要24-48小时)
- 使用 `dig` 命令检查:
```bash
dig your-domain.com
```

### 8. 性能问题

#### 页面加载慢
```bash
# 构建生产版本测试
npm run build
npm start
```

#### API 响应慢
- Yahoo Finance API 有时会慢
- 考虑添加缓存:
```typescript
// 使用 Next.js 的 revalidate
export const revalidate = 300; // 5分钟
```

### 9. 数据不准确

#### 比率计算错误
- 检查 API 返回的数据
- 确认日期对齐正确
- 查看浏览器控制台日志

#### 历史数据缺失
- Yahoo Finance 有时会有数据缺口
- 这是正常的,代码会自动过滤空值

### 10. 浏览器兼容性

#### 旧浏览器不支持
**支持的浏览器:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**不支持 IE11**

### 调试技巧

#### 1. 查看浏览器控制台
```
F12 或 Cmd+Option+I (Mac)
```

#### 2. 查看网络请求
- 浏览器开发工具 -> Network 标签
- 查看 API 请求和响应

#### 3. 添加日志
```typescript
console.log('Debug:', data);
```

#### 4. 使用 React DevTools
- 安装 React DevTools 浏览器扩展
- 检查组件状态和 props

### 获取帮助

如果以上方法都无法解决问题:

1. **查看日志**
   - 浏览器控制台
   - 终端输出
   - Vercel 部署日志

2. **搜索错误信息**
   - Google 搜索完整错误信息
   - 查看 Next.js 文档
   - Stack Overflow

3. **提交 Issue**
   - 在 GitHub 仓库提交 Issue
   - 包含:
     - 错误信息
     - 复现步骤
     - 环境信息(Node版本、系统等)
     - 截图

### 预防措施

1. **定期更新依赖**
```bash
npm outdated
npm update
```

2. **使用版本控制**
```bash
git commit -m "Working version before changes"
```

3. **测试后再部署**
```bash
npm run build
npm start
# 测试功能
# 确认无误后再部署
```

4. **监控错误**
- 使用 Sentry 等错误监控工具
- 定期检查日志

### 快速重置

如果一切都乱了,从头开始:

```bash
# 1. 备份数据(如果有)
cp -r market-bubble-tracker market-bubble-tracker-backup

# 2. 清理
cd market-bubble-tracker
rm -rf node_modules .next package-lock.json

# 3. 重新安装
npm install

# 4. 启动
npm run dev
```

### 联系支持

- **GitHub Issues**: 提交技术问题
- **文档**: 查看 README.md 和其他文档
- **社区**: Next.js Discord 社区

---

**记住**: 大多数问题都可以通过清除缓存和重新安装依赖解决!
