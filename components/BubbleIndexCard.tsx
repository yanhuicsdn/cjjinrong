'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface BubbleIndexData {
  index: number;
  level: string;
  color: string;
  description: string;
  components: {
    ratioScore: number;
    zScoreScore: number;
    spreadScore: number;
    historicalScore: number;
  };
  breakdown: string[];
  recommendation: string;
}

interface BubbleIndexCardProps {
  ratio: string;
  zScore: string;
  mean: string;
  max: string;
  spreadTrend: string;
}

export default function BubbleIndexCard({ ratio, zScore, mean, max, spreadTrend }: BubbleIndexCardProps) {
  const [data, setData] = useState<BubbleIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBubbleIndex();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, zScore, mean, max, spreadTrend]);

  const fetchBubbleIndex = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ratio,
        zScore,
        mean,
        max,
        spreadTrend
      });
      
      const response = await fetch(`/api/bubble-index?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch bubble index:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const colorClasses = getColorClasses(data.color);

  return (
    <div className={`${colorClasses.bg} border-2 ${colorClasses.border} rounded-lg shadow-lg p-6 mb-8`}>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className={`w-6 h-6 ${colorClasses.text}`} />
          市场泡沫风险指数
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Info className="w-4 h-4" />
          {showDetails ? '隐藏详情' : '查看详情'}
        </button>
      </div>

      {/* 主要指数显示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 左侧: 指数仪表盘 */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            {/* 圆形进度条 */}
            <svg className="w-full h-full transform -rotate-90">
              {/* 背景圆 */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* 进度圆 */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(data.index / 100) * 553} 553`}
                className={colorClasses.text}
                strokeLinecap="round"
              />
            </svg>
            {/* 中心数字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${colorClasses.text}`}>
                {data.index}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
            </div>
          </div>
          <div className={`mt-4 text-xl font-bold ${colorClasses.text}`}>
            {data.level}
          </div>
        </div>

        {/* 右侧: 组成部分 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">指数构成:</h3>
          
          {/* 比率得分 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">SP500/黄金比率</span>
              <span className="font-semibold">{data.components.ratioScore}/30</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClasses.gauge} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(data.components.ratioScore / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Z-Score得分 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Z-Score偏离度</span>
              <span className="font-semibold">{data.components.zScoreScore}/30</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClasses.gauge} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(data.components.zScoreScore / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 利差得分 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">债券利差趋势</span>
              <span className="font-semibold">{data.components.spreadScore}/20</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClasses.gauge} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(data.components.spreadScore / 20) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 历史对比得分 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">历史泡沫对比</span>
              <span className="font-semibold">{data.components.historicalScore}/20</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClasses.gauge} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(data.components.historicalScore / 20) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 描述 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>当前状态:</strong> {data.description}
        </p>
      </div>

      {/* 详细分析 (可折叠) */}
      {showDetails && (
        <div className="space-y-4 animate-fadeIn">
          {/* 详细分解 */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📊 详细分析:</h4>
            <ul className="space-y-2">
              {data.breakdown.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 投资建议 */}
          <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${colorClasses.border}`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              投资建议:
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {data.recommendation}
            </p>
          </div>

          {/* 指数说明 */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>指数计算方法:</strong> 泡沫指数综合了4个关键指标,总分100分:
            </p>
            <ul className="space-y-1 ml-4">
              <li>• SP500/黄金比率 (30分): 衡量股票相对黄金的估值</li>
              <li>• Z-Score偏离度 (30分): 衡量当前比率偏离历史均值的程度</li>
              <li>• 债券利差趋势 (20分): 衡量市场风险偏好变化</li>
              <li>• 历史泡沫对比 (20分): 与2000年、2008年等关键时期对比</li>
            </ul>
            <p className="mt-2">
              <strong>风险等级:</strong> 0-20(低估值) | 20-35(安全) | 35-50(轻度风险) | 50-65(中度风险) | 65-80(高度风险) | 80-100(极度危险)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
