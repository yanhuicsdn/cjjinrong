'use client';

import { X, Calculator } from 'lucide-react';
import { useState } from 'react';

interface CalculationModalProps {
  marketData: {
    current: {
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
  };
  spreadData: {
    current: {
      treasuryYield: string;
    };
    statistics: {
      trend30d: string;
    };
  };
}

export default function CalculationModal({ marketData, spreadData }: CalculationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sp500 = parseFloat(marketData.current.sp500);
  const gold = parseFloat(marketData.current.gold);
  const ratio = parseFloat(marketData.current.ratio);
  const mean = parseFloat(marketData.statistics.mean);
  const std = parseFloat(marketData.statistics.std);
  const zScore = parseFloat(marketData.statistics.zScore);

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        <Calculator className="w-4 h-4" />
        查看计算过程
      </button>

      {/* 模态框 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  指标计算详解
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-6">
              {/* 1. 标普500/黄金比率计算 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  标普500/黄金比率计算
                </h3>
                
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">📊 原始数据:</p>
                    <div className="grid grid-cols-2 gap-3 ml-4">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">标普500指数:</span>
                        <span className="ml-2 font-mono font-bold text-blue-600">{sp500.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">黄金价格:</span>
                        <span className="ml-2 font-mono font-bold text-yellow-600">${gold.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">🧮 计算公式:</p>
                    <div className="ml-4 font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded">
                      比率 = 标普500指数 ÷ 黄金价格
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">💡 计算过程:</p>
                    <div className="ml-4 space-y-2">
                      <div className="font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded">
                        比率 = {sp500.toFixed(2)} ÷ {gold.toFixed(2)}
                      </div>
                      <div className="font-mono bg-purple-100 dark:bg-purple-900 p-3 rounded font-bold">
                        比率 = {ratio.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm">
                      <strong>💡 含义:</strong> 这个比率表示用黄金计价的股票价格。
                      比率越高,说明股票相对黄金越贵,可能存在泡沫风险。
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Z-Score计算 */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Z-Score (标准分数) 计算
                </h3>
                
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">📊 统计数据:</p>
                    <div className="grid grid-cols-2 gap-3 ml-4">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">当前比率:</span>
                        <span className="ml-2 font-mono font-bold">{ratio.toFixed(3)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">历史均值 (μ):</span>
                        <span className="ml-2 font-mono font-bold">{mean.toFixed(3)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">标准差 (σ):</span>
                        <span className="ml-2 font-mono font-bold">{std.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">🧮 计算公式:</p>
                    <div className="ml-4 font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded">
                      Z-Score = (当前值 - 均值) ÷ 标准差
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">💡 计算过程:</p>
                    <div className="ml-4 space-y-2">
                      <div className="font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded">
                        Z-Score = ({ratio.toFixed(3)} - {mean.toFixed(3)}) ÷ {std.toFixed(3)}
                      </div>
                      <div className="font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded">
                        Z-Score = {(ratio - mean).toFixed(3)} ÷ {std.toFixed(3)}
                      </div>
                      <div className="font-mono bg-green-100 dark:bg-green-900 p-3 rounded font-bold">
                        Z-Score = {zScore.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm mb-2">
                      <strong>💡 Z-Score 解读:</strong>
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• <strong>Z &gt; 2</strong>: 🔴 高风险 - 显著高于历史均值</li>
                      <li>• <strong>1 &lt; Z &lt; 2</strong>: 🟡 中等风险 - 高于均值</li>
                      <li>• <strong>-1 &lt; Z &lt; 1</strong>: 🟢 正常范围</li>
                      <li>• <strong>Z &lt; -1</strong>: 🔵 可能低估</li>
                    </ul>
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded">
                      <strong>当前状态:</strong> Z-Score = {zScore.toFixed(2)} 
                      {zScore > 2 && <span className="ml-2 text-red-600 font-bold">→ 高风险区域</span>}
                      {zScore > 1 && zScore <= 2 && <span className="ml-2 text-yellow-600 font-bold">→ 中等风险</span>}
                      {zScore >= -1 && zScore <= 1 && <span className="ml-2 text-green-600 font-bold">→ 正常范围</span>}
                      {zScore < -1 && <span className="ml-2 text-blue-600 font-bold">→ 可能低估</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 国债收益率趋势 */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                  国债收益率30日趋势
                </h3>
                
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">📊 数据:</p>
                    <div className="grid grid-cols-2 gap-3 ml-4">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">当前收益率:</span>
                        <span className="ml-2 font-mono font-bold">{spreadData.current.treasuryYield}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">30日变化:</span>
                        <span className={`ml-2 font-mono font-bold ${parseFloat(spreadData.statistics.trend30d) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {parseFloat(spreadData.statistics.trend30d) > 0 ? '+' : ''}{spreadData.statistics.trend30d}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">🧮 计算方法:</p>
                    <div className="ml-4 font-mono bg-gray-100 dark:bg-slate-700 p-3 rounded text-sm">
                      30日趋势 = 当前收益率 - 30天前收益率
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
                    <p className="text-sm mb-2">
                      <strong>💡 趋势解读:</strong>
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• <strong>趋势为正 (+)</strong>: 收益率上升,债券价格下跌,利差可能扩大</li>
                      <li>• <strong>趋势为负 (-)</strong>: 收益率下降,债券价格上涨,市场避险情绪</li>
                      <li>• <strong>趋势接近0</strong>: 收益率稳定</li>
                    </ul>
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded">
                      <strong>当前状态:</strong> 
                      {parseFloat(spreadData.statistics.trend30d) > 0.1 && <span className="ml-2 text-red-600 font-bold">收益率快速上升</span>}
                      {parseFloat(spreadData.statistics.trend30d) < -0.1 && <span className="ml-2 text-green-600 font-bold">收益率快速下降</span>}
                      {Math.abs(parseFloat(spreadData.statistics.trend30d)) <= 0.1 && <span className="ml-2 text-blue-600 font-bold">收益率相对稳定</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 总结 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📝 综合分析
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>1. 估值水平:</strong> 当前SP500/黄金比率为 {ratio.toFixed(3)},
                    {zScore > 1 ? '高于' : zScore < -1 ? '低于' : '接近'}历史均值,
                    Z-Score为 {zScore.toFixed(2)}。
                  </p>
                  <p>
                    <strong>2. 风险提示:</strong> 
                    {zScore > 2 && ' 比率显著偏高,市场可能存在泡沫,建议谨慎。'}
                    {zScore > 1 && zScore <= 2 && ' 比率偏高,需要密切关注市场变化。'}
                    {zScore >= -1 && zScore <= 1 && ' 比率在正常范围内,市场估值相对合理。'}
                    {zScore < -1 && ' 比率偏低,可能存在投资机会,但需结合其他指标判断。'}
                  </p>
                  <p>
                    <strong>3. 债券市场:</strong> 10年期国债收益率为 {spreadData.current.treasuryYield}%,
                    30日变化 {parseFloat(spreadData.statistics.trend30d) > 0 ? '上升' : '下降'} {Math.abs(parseFloat(spreadData.statistics.trend30d)).toFixed(3)}%。
                  </p>
                </div>
              </div>
            </div>

            {/* 底部 */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
