'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RatioChartProps {
  data: Array<{
    date: string;
    sp500: number;
    gold: number;
    ratio: number;
  }>;
}

export default function RatioChart({ data }: RatioChartProps) {
  // 格式化数据用于图表显示
  const chartData = data.map(item => ({
    date: item.date,
    ratio: parseFloat(item.ratio.toFixed(3)),
  }));

  // 历史关键点位
  const dotComBubble = 5.5;
  const crisis2008 = 1.5;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          }}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: 'SP500/黄金比率', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px'
          }}
          labelFormatter={(value) => `日期: ${value}`}
          formatter={(value: number) => [value.toFixed(3), 'SP500/黄金']}
        />
        <Legend />
        
        {/* 参考线: 2000年互联网泡沫 */}
        <ReferenceLine 
          y={dotComBubble} 
          stroke="#ef4444" 
          strokeDasharray="5 5"
          label={{ value: '2000年泡沫峰值 (5.5)', position: 'right', fill: '#ef4444', fontSize: 12 }}
        />
        
        {/* 参考线: 2008年金融危机 */}
        <ReferenceLine 
          y={crisis2008} 
          stroke="#3b82f6" 
          strokeDasharray="5 5"
          label={{ value: '2008年危机低点 (1.5)', position: 'right', fill: '#3b82f6', fontSize: 12 }}
        />
        
        <Line 
          type="monotone" 
          dataKey="ratio" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={false}
          name="SP500/黄金比率"
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
