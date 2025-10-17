'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RatioChartProps {
  data: Array<{
    date: string;
    shanghai: number;
    gold: number;
    ratio: number;
  }>;
}

export default function AShareRatioChart({ data }: RatioChartProps) {
  // 格式化数据
  const chartData = data.map(item => ({
    date: item.date,
    ratio: parseFloat(item.ratio.toFixed(3))
  }));

  // 计算平均值
  const ratios = chartData.map(d => d.ratio);
  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        上证指数/黄金比率历史走势
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
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
            labelFormatter={(value) => `日期: ${value}`}
            formatter={(value: number) => [value.toFixed(3), '比率']}
          />
          <Legend />
          
          {/* 历史参考线 */}
          <ReferenceLine 
            y={2.5} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ value: '2007年大牛市 (2.5)', position: 'right', fill: '#ef4444', fontSize: 12 }}
          />
          <ReferenceLine 
            y={2.2} 
            stroke="#f97316" 
            strokeDasharray="5 5"
            label={{ value: '2015年股灾前 (2.2)', position: 'right', fill: '#f97316', fontSize: 12 }}
          />
          <ReferenceLine 
            y={mean} 
            stroke="#3b82f6" 
            strokeDasharray="3 3"
            label={{ value: `历史均值 (${mean.toFixed(2)})`, position: 'right', fill: '#3b82f6', fontSize: 12 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="ratio" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={false}
            name="上证/黄金比率"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">当前比率</div>
          <div className="font-bold text-purple-600 dark:text-purple-400">
            {chartData[chartData.length - 1]?.ratio.toFixed(3)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">历史均值</div>
          <div className="font-bold text-blue-600 dark:text-blue-400">
            {mean.toFixed(3)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">历史最高</div>
          <div className="font-bold text-red-600 dark:text-red-400">
            {Math.max(...ratios).toFixed(3)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">历史最低</div>
          <div className="font-bold text-green-600 dark:text-green-400">
            {Math.min(...ratios).toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
}
