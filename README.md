# 📊 美股市场泡沫追踪器

一个实时监控美股市场泡沫指标的Web应用,帮助投资者精准把握市场风险,避免在泡沫顶峰接盘。

## 📖 文档导航

- **[⚡ 快速开始](./QUICK_START.md)** - 5分钟上手指南
- **[📚 使用指南](./USAGE_GUIDE.md)** - 详细的指标解读和使用建议
- **[🚀 部署指南](./DEPLOYMENT.md)** - 部署到 Vercel 或自己的服务器
- **[🔧 故障排除](./TROUBLESHOOTING.md)** - 常见问题和解决方案
- **[📝 项目总结](./PROJECT_SUMMARY.md)** - 完整的项目文档

## 🎯 核心功能

### 1. **标普500/黄金比率追踪**
- 实时计算并展示 SP500/黄金 的比率
- 历史数据对比(支持1年、2年、5年、10年、全部)
- 与历史关键时期对比:
  - 1929年大萧条前峰值 (~18.0)
  - 2000年互联网泡沫峰值 (~5.5)
  - 2008年金融危机低点 (~1.5)
- Z-Score统计分析,量化当前市场位置

### 2. **国债收益率与债券利差监控**
- 10年期美国国债收益率实时追踪
- 公司债券与国债利差分析
- 利差扩大预警(市场风险上升信号)
- 30日趋势分析

### 3. **智能风险评估**
- 自动计算风险等级(高风险/中等风险/相对安全/低估值)
- 可视化风险提示
- 历史统计数据支持

### 4. **精美的数据可视化**
- 交互式图表展示历史走势
- 关键点位参考线标注
- 响应式设计,支持移动端

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 📖 指标说明

### 标普500/黄金比率

这个指标将黄金视为货币,衡量以黄金计价的股票价格。它能够:
- 消除通胀和货币贬值的影响
- 反映股票的真实估值水平
- 历史上精准预测了市场泡沫

**历史参考:**
- **1929年**: 比率达到~18.0,随后发生大萧条
- **2000年**: 比率达到~5.5,互联网泡沫破裂
- **2008年**: 危机后降至~1.5,是绝佳买入时机
- **当前**: 比2000年峰值低约70%,但仍需警惕

### 债券利差

监控科技公司债券收益率与国债收益率的差距:
- **利差扩大**: 市场风险偏好下降,资金流向安全资产
- **利差收窄**: 市场风险偏好上升,投资者追逐高收益
- 利差快速扩大通常是市场调整的前兆

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **图表**: Recharts
- **图标**: Lucide React
- **数据源**: Yahoo Finance API

## 📁 项目结构

```
market-bubble-tracker/
├── app/
│   ├── api/
│   │   ├── market-data/      # 标普500/黄金数据API
│   │   └── treasury-spread/  # 国债利差数据API
│   ├── page.tsx              # 主页面
│   └── layout.tsx            # 布局
├── components/
│   ├── MarketDashboard.tsx   # 主仪表盘组件
│   ├── RatioChart.tsx        # 比率图表组件
│   ├── SpreadChart.tsx       # 利差图表组件
│   └── MetricCard.tsx        # 指标卡片组件
└── README.md
```

## 🔧 API端点

### GET /api/market-data
获取标普500/黄金比率数据

**参数:**
- `period`: 时间周期 (1y, 2y, 5y, 10y, max)

**返回:**
```json
{
  "success": true,
  "data": {
    "current": { "date", "sp500", "gold", "ratio" },
    "statistics": { "mean", "std", "max", "min", "zScore" },
    "risk": { "level", "color", "description" },
    "historicalComparison": { ... },
    "historicalData": [ ... ]
  }
}
```

### GET /api/treasury-spread
获取国债收益率和利差数据

**参数:**
- `period`: 时间周期 (默认1y)

**返回:**
```json
{
  "success": true,
  "data": {
    "current": { "date", "treasuryYield", "spread" },
    "statistics": { "mean", "std", "trend30d" },
    "risk": { "level", "color", "description" },
    "historicalData": [ ... ]
  }
}
```

## ⚠️ 免责声明

本工具仅供参考和学习使用,不构成任何投资建议。

- 所有数据来自公开的Yahoo Finance API
- 历史表现不代表未来结果
- 投资有风险,入市需谨慎
- 请在做出投资决策前咨询专业的财务顾问

## 📝 使用建议

1. **定期监控**: 建议每周查看一次指标变化
2. **综合判断**: 结合多个指标和其他市场信息做决策
3. **关注趋势**: 比单一数值更重要的是趋势变化
4. **设置提醒**: 当Z-Score超过2时提高警惕
5. **利差扩大**: 当利差开始快速扩大时考虑降低仓位

## 🤝 贡献

欢迎提交Issue和Pull Request!

## 📄 许可证

MIT License
