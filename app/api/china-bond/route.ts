import { NextResponse } from 'next/server';

// 获取中国国债收益率数据
async function fetchYahooFinance(symbol: string, range: string = '1y') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch ${symbol}: ${response.status}`, errorText);
      throw new Error(`Failed to fetch ${symbol}: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error(`Invalid data structure for ${symbol}`);
      throw new Error(`Invalid data structure for ${symbol}`);
    }
    
    return data.chart.result[0];
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1y';
    
    // 使用中国10年期国债ETF作为代理 (如果可用)
    // 或者使用沪深300指数的波动率作为风险指标
    // 这里我们使用一个简化的方法,基于上证指数的波动率
    
    // 获取上证指数数据来计算波动率
    const shanghaiData = await fetchYahooFinance('000001.SS', period);
    
    const timestamps = shanghaiData.timestamp;
    const prices = shanghaiData.indicators.quote[0].close;
    
    // 计算每日收益率
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] && prices[i-1] && prices[i-1] > 0) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
      }
    }
    
    // 计算波动率 (年化)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 252) * 100; // 年化波动率
    
    // 计算30日波动率变化
    const recent30Returns = returns.slice(-30);
    const recent30Variance = recent30Returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / recent30Returns.length;
    const recent30Volatility = Math.sqrt(recent30Variance * 252) * 100;
    
    const volatilityTrend = recent30Volatility - volatility;
    
    // 使用模拟的国债收益率 (实际应该从真实数据源获取)
    // 中国10年期国债收益率通常在2.5%-3.5%之间
    const simulatedBondYield = 2.8; // 这是一个示例值,实际应该从API获取
    
    // 风险评估
    let riskLevel = '正常';
    let riskColor = 'green';
    let riskDescription = '市场波动率处于正常范围';
    
    if (volatility > 30) {
      riskLevel = '高波动';
      riskColor = 'red';
      riskDescription = '市场波动率较高,风险上升';
    } else if (volatility > 20) {
      riskLevel = '中等波动';
      riskColor = 'yellow';
      riskDescription = '市场波动率偏高,需要关注';
    } else if (volatility < 10) {
      riskLevel = '低波动';
      riskColor = 'blue';
      riskDescription = '市场波动率较低,相对平稳';
    }
    
    // 构建历史数据
    const historicalData = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (prices[i]) {
        const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        historicalData.push({
          date,
          volatility: volatility, // 简化处理,实际应该计算每日的波动率
          bondYield: simulatedBondYield,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        current: {
          date: new Date().toISOString().split('T')[0],
          bondYield: simulatedBondYield.toFixed(3),
          volatility: volatility.toFixed(2),
        },
        statistics: {
          avgVolatility: volatility.toFixed(2),
          recent30Volatility: recent30Volatility.toFixed(2),
          trend30d: volatilityTrend.toFixed(3),
        },
        risk: {
          level: riskLevel,
          color: riskColor,
          description: riskDescription,
        },
        historicalData: historicalData.slice(-365),
        note: '注意: 由于数据源限制,国债收益率为模拟数据。波动率基于上证指数计算。'
      }
    });
    
  } catch (error) {
    console.error('China Bond API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch China bond data' 
      },
      { status: 500 }
    );
  }
}
