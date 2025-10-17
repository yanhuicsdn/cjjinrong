'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SpreadChartProps {
  data: Array<{
    date: string;
    treasuryYield: number;
    corporateBondPrice: number;
    spread: number;
  }>;
}

export default function SpreadChart({ data }: SpreadChartProps) {
  const chartData = data.map(item => ({
    date: item.date,
    treasuryYield: parseFloat(item.treasuryYield.toFixed(3)),
    spread: parseFloat(item.spread.toFixed(3)),
  }));

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
          minTickGap={30}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px'
          }}
          labelFormatter={(value) => `日期: ${value}`}
          formatter={(value: number, name: string) => {
            const label = name === 'treasuryYield' ? '10年期国债' : '利差';
            return [value.toFixed(3) + '%', label];
          }}
        />
        <Legend />
        
        <Line 
          type="monotone" 
          dataKey="treasuryYield" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={false}
          name="10年期国债收益率"
          animationDuration={1000}
        />
        
        <Line 
          type="monotone" 
          dataKey="spread" 
          stroke="#f59e0b" 
          strokeWidth={2}
          dot={false}
          name="利差"
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
