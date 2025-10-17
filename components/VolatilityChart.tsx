'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VolatilityChartProps {
  data: Array<{
    date: string;
    volatility: number;
  }>;
  currentVolatility: number;
}

export default function VolatilityChart({ data, currentVolatility }: VolatilityChartProps) {
  // 格式化数据
  const chartData = data.slice(-365).map(item => ({
    date: item.date,
    volatility: parseFloat(item.volatility.toFixed(2))
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        市场波动率走势
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            label={{ value: '波动率 (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
            labelFormatter={(value) => `日期: ${value}`}
            formatter={(value: number) => [`${value.toFixed(2)}%`, '波动率']}
          />
          <Legend />
          
          {/* 波动率参考线 */}
          <ReferenceLine 
            y={30} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ value: '高波动 (30%)', position: 'right', fill: '#ef4444', fontSize: 12 }}
          />
          <ReferenceLine 
            y={20} 
            stroke="#f59e0b" 
            strokeDasharray="5 5"
            label={{ value: '中等波动 (20%)', position: 'right', fill: '#f59e0b', fontSize: 12 }}
          />
          <ReferenceLine 
            y={10} 
            stroke="#10b981" 
            strokeDasharray="5 5"
            label={{ value: '低波动 (10%)', position: 'right', fill: '#10b981', fontSize: 12 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="volatility" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={false}
            name="年化波动率"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">当前波动率</div>
          <div className="font-bold text-cyan-600 dark:text-cyan-400">
            {currentVolatility.toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">风险等级</div>
          <div className={`font-bold ${
            currentVolatility > 30 ? 'text-red-600 dark:text-red-400' :
            currentVolatility > 20 ? 'text-yellow-600 dark:text-yellow-400' :
            currentVolatility > 10 ? 'text-blue-600 dark:text-blue-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {currentVolatility > 30 ? '高波动' :
             currentVolatility > 20 ? '中等波动' :
             currentVolatility > 10 ? '正常' : '低波动'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">市场状态</div>
          <div className="font-bold text-gray-700 dark:text-gray-300">
            {currentVolatility > 25 ? '情绪不稳' : 
             currentVolatility > 15 ? '相对活跃' : '相对平稳'}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-400">
        <strong>说明:</strong> 波动率基于上证指数日收益率计算的年化波动率。
        波动率越高,表示市场价格波动越剧烈,投资风险越大。
      </div>
    </div>
  );
}
