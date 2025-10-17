'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Activity, RefreshCw } from 'lucide-react';
import RatioChart from './RatioChart';
import SpreadChart from './SpreadChart';
import MetricCard from './MetricCard';
import ExportButton from './ExportButton';

interface MarketData {
  current: {
    date: string;
    sp500: string;
    gold: string;
    ratio: string;
  };
  statistics: {
    mean: string;
    std: string;
    max: string;
    min: string;
    zScore: string;
  };
  risk: {
    level: string;
    color: string;
    description: string;
  };
  historicalComparison: {
    vsDotComBubble2000: string;
    dotComBubbleRatio: number;
    currentVsDotCom: string;
  };
  historicalData: Array<{
    date: string;
    sp500: number;
    gold: number;
    ratio: number;
  }>;
  fullHistoricalData: Array<{
    date: string;
    sp500: number;
    gold: number;
    ratio: number;
  }>;
}

interface SpreadData {
  current: {
    date: string;
    treasuryYield: string;
    corporateBondPrice: string;
    spread: string;
  };
  statistics: {
    mean: string;
    std: string;
    max: string;
    min: string;
    trend30d: string;
  };
  risk: {
    level: string;
    color: string;
    description: string;
  };
  historicalData: Array<{
    date: string;
    treasuryYield: number;
    corporateBondPrice: number;
    spread: number;
  }>;
  note: string;
}

export default function MarketDashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [spreadData, setSpreadData] = useState<SpreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('5y');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [marketRes, spreadRes] = await Promise.all([
        fetch(`/api/market-data?period=${selectedPeriod}`),
        fetch(`/api/treasury-spread?period=1y`)
      ]);

      if (!marketRes.ok || !spreadRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const marketJson = await marketRes.json();
      const spreadJson = await spreadRes.json();

      if (marketJson.success && spreadJson.success) {
        setMarketData(marketJson.data);
        setSpreadData(spreadJson.data);
      } else {
        throw new Error('Invalid data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const getRiskColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[color] || colors.green;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">加载市场数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-lg text-red-600 font-semibold mb-2">加载失败</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!marketData || !spreadData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📊 美股市场泡沫追踪器
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              实时监控标普500/黄金比率与债券利差,精准把握市场风险
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              最后更新: {marketData.current.date}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <ExportButton 
              data={marketData.fullHistoricalData} 
              filename="sp500-gold-ratio"
              label="导出数据"
            />
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['1y', '2y', '5y', '10y', 'max'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {period.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="标普500"
          value={marketData.current.sp500}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="黄金价格"
          value={`$${marketData.current.gold}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="yellow"
        />
        <MetricCard
          title="SP500/黄金比率"
          value={marketData.current.ratio}
          subtitle={`Z-Score: ${marketData.statistics.zScore}`}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="10年期国债收益率"
          value={`${spreadData.current.treasuryYield}%`}
          subtitle={`30日趋势: ${spreadData.statistics.trend30d}`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Risk Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`p-6 rounded-lg border-2 ${getRiskColor(marketData.risk.color)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                标普500/黄金比率: {marketData.risk.level}
              </h3>
              <p className="text-sm mb-2">{marketData.risk.description}</p>
              <p className="text-xs">
                当前比率 {marketData.historicalComparison.currentVsDotCom} 2000年互联网泡沫峰值 
                ({marketData.historicalComparison.vsDotComBubble2000})
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${getRiskColor(spreadData.risk.color)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                债券利差: {spreadData.risk.level}
              </h3>
              <p className="text-sm">{spreadData.risk.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            标普500/黄金比率历史走势
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            此指标衡量股票相对黄金的估值。历史高点出现在2000年互联网泡沫(~5.5)和1929年大萧条前(~18)
          </p>
          <RatioChart data={marketData.fullHistoricalData} />
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">当前值</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{marketData.current.ratio}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">历史均值</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{marketData.statistics.mean}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">历史最高</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{marketData.statistics.max}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">历史最低</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{marketData.statistics.min}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            国债收益率与债券利差走势
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            监控国债收益率变化。利差扩大通常预示市场风险上升
          </p>
          <SpreadChart data={spreadData.historicalData} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            {spreadData.note}
          </p>
        </div>
      </div>

      {/* Historical Context */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          📚 历史参考
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-bold text-red-600 mb-2">1929年大萧条</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              SP500/黄金比率达到 ~18.0,随后股市崩盘
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-bold text-orange-600 mb-2">2000年互联网泡沫</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              比率达到 ~5.5,标志着科技股泡沫顶峰
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-bold text-blue-600 mb-2">2008年金融危机</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              危机后比率降至 ~1.5,为买入良机
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>数据来源: Yahoo Finance API</p>
        <p className="mt-2">
          ⚠️ 免责声明: 本工具仅供参考,不构成投资建议。投资有风险,入市需谨慎。
        </p>
      </div>
    </div>
  );
}
