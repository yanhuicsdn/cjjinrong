'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Activity, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import ExportButton from '@/components/ExportButton';

interface AShareData {
  current: {
    date: string;
    shanghai: string;
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
    vs2015Bubble: string;
    vs2007Bubble: string;
    bubble2015Ratio: number;
    bubble2007Ratio: number;
    currentVs2015: string;
    currentVs2007: string;
  };
  historicalData: Array<{
    date: string;
    shanghai: number;
    gold: number;
    ratio: number;
  }>;
  fullHistoricalData: Array<{
    date: string;
    shanghai: number;
    gold: number;
    ratio: number;
  }>;
}

interface BondData {
  current: {
    date: string;
    bondYield: string;
    volatility: string;
  };
  statistics: {
    avgVolatility: string;
    recent30Volatility: string;
    trend30d: string;
  };
  risk: {
    level: string;
    color: string;
    description: string;
  };
  note: string;
}

interface BubbleIndexData {
  index: number;
  level: string;
  color: string;
  description: string;
  components: {
    ratioScore: number;
    zScoreScore: number;
    volatilityScore: number;
    historicalScore: number;
  };
  breakdown: string[];
  recommendation: string;
}

export default function ASharePage() {
  const [aShareData, setAShareData] = useState<AShareData | null>(null);
  const [bondData, setBondData] = useState<BondData | null>(null);
  const [bubbleIndex, setBubbleIndex] = useState<BubbleIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('5y');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [aShareRes, bondRes] = await Promise.all([
        fetch(`/api/a-share-data?period=${selectedPeriod}`),
        fetch(`/api/china-bond?period=1y`)
      ]);

      if (!aShareRes.ok || !bondRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const aShareJson = await aShareRes.json();
      const bondJson = await bondRes.json();

      if (aShareJson.success && bondJson.success) {
        setAShareData(aShareJson.data);
        setBondData(bondJson.data);
        
        // 获取泡沫指数
        const bubbleParams = new URLSearchParams({
          ratio: aShareJson.data.current.ratio,
          zScore: aShareJson.data.statistics.zScore,
          mean: aShareJson.data.statistics.mean,
          max: aShareJson.data.statistics.max,
          volatility: bondJson.data.current.volatility
        });
        
        const bubbleRes = await fetch(`/api/a-share-bubble-index?${bubbleParams}`);
        const bubbleJson = await bubbleRes.json();
        
        if (bubbleJson.success) {
          setBubbleIndex(bubbleJson.data);
        }
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
      green: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      red: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      orange: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
      teal: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
    };
    return colors[color] || colors.green;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; gauge: string }> = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500',
        text: 'text-red-700 dark:text-red-400',
        gauge: 'bg-red-600'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-500',
        text: 'text-orange-700 dark:text-orange-400',
        gauge: 'bg-orange-600'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-500',
        text: 'text-yellow-700 dark:text-yellow-400',
        gauge: 'bg-yellow-600'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        text: 'text-blue-700 dark:text-blue-400',
        gauge: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-500',
        text: 'text-green-700 dark:text-green-400',
        gauge: 'bg-green-600'
      },
      teal: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-500',
        text: 'text-teal-700 dark:text-teal-400',
        gauge: 'bg-teal-600'
      }
    };
    return colors[color] || colors.green;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载A股数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!aShareData || !bondData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回美股追踪器
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📈 A股市场泡沫追踪器
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              实时监控上证指数/黄金比率与市场波动率,精准把握A股风险
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              最后更新: {aShareData.current.date}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <ExportButton 
              data={aShareData.fullHistoricalData} 
              filename="a-share-gold-ratio"
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
          title="上证指数"
          value={aShareData.current.shanghai}
          subtitle={`数据日期: ${aShareData.current.date}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="黄金价格"
          value={`$${aShareData.current.gold}`}
          subtitle="国际金价"
          icon={<DollarSign className="w-6 h-6" />}
          color="yellow"
        />
        <MetricCard
          title="上证/黄金比率"
          value={aShareData.current.ratio}
          subtitle={`Z-Score: ${aShareData.statistics.zScore}`}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="市场波动率"
          value={`${bondData.current.volatility}%`}
          subtitle={`30日变化: ${bondData.statistics.trend30d}`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Bubble Index Card */}
      {bubbleIndex && (
        <div className={`${getColorClasses(bubbleIndex.color).bg} border-2 ${getColorClasses(bubbleIndex.color).border} rounded-lg shadow-lg p-6 mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className={`w-6 h-6 ${getColorClasses(bubbleIndex.color).text}`} />
              A股泡沫风险指数
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 左侧: 指数仪表盘 */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(bubbleIndex.index / 100) * 553} 553`}
                    className={getColorClasses(bubbleIndex.color).text}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold ${getColorClasses(bubbleIndex.color).text}`}>
                    {bubbleIndex.index}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
                </div>
              </div>
              <div className={`mt-4 text-xl font-bold ${getColorClasses(bubbleIndex.color).text}`}>
                {bubbleIndex.level}
              </div>
            </div>

            {/* 右侧: 组成部分 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">指数构成:</h3>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">上证/黄金比率</span>
                  <span className="font-semibold">{bubbleIndex.components.ratioScore}/30</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getColorClasses(bubbleIndex.color).gauge} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(bubbleIndex.components.ratioScore / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Z-Score偏离度</span>
                  <span className="font-semibold">{bubbleIndex.components.zScoreScore}/30</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getColorClasses(bubbleIndex.color).gauge} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(bubbleIndex.components.zScoreScore / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">市场波动率</span>
                  <span className="font-semibold">{bubbleIndex.components.volatilityScore}/20</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getColorClasses(bubbleIndex.color).gauge} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(bubbleIndex.components.volatilityScore / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">历史泡沫对比</span>
                  <span className="font-semibold">{bubbleIndex.components.historicalScore}/20</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getColorClasses(bubbleIndex.color).gauge} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(bubbleIndex.components.historicalScore / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>当前状态:</strong> {bubbleIndex.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📊 详细分析:</h4>
              <ul className="space-y-2">
                {bubbleIndex.breakdown.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${getColorClasses(bubbleIndex.color).border}`}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                投资建议:
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {bubbleIndex.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`p-6 rounded-lg border-2 ${getRiskColor(aShareData.risk.color)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                上证指数/黄金比率: {aShareData.risk.level}
              </h3>
              <p className="text-sm mb-2">{aShareData.risk.description}</p>
              <p className="text-xs">
                当前比率 {aShareData.historicalComparison.currentVs2015} 2015年股灾前峰值 
                ({aShareData.historicalComparison.vs2015Bubble})
              </p>
              <p className="text-xs mt-1">
                当前比率 {aShareData.historicalComparison.currentVs2007} 2007年大牛市峰值 
                ({aShareData.historicalComparison.vs2007Bubble})
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${getRiskColor(bondData.risk.color)}`}>
          <div className="flex items-start gap-3">
            <Activity className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                市场波动率: {bondData.risk.level}
              </h3>
              <p className="text-sm mb-2">{bondData.risk.description}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {bondData.note}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ℹ️ A股市场特点说明
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• A股市场波动性较大,政策影响显著,需要密切关注政策导向</li>
          <li>• 历史参考: 2007年大牛市(上证6124点)、2015年股灾前(上证5178点)</li>
          <li>• 由于数据源限制,国债收益率为模拟数据,波动率基于上证指数计算</li>
          <li>• 建议结合基本面分析、政策面分析和技术面分析综合判断</li>
        </ul>
      </div>
    </div>
  );
}
