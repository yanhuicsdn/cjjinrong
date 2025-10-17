import { NextResponse } from 'next/server';

// Yahoo Finance API
async function fetchYahooFinance(symbol: string, range: string = '5y', interval: string = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // 缓存5分钟
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch ${symbol}: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch ${symbol}: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error(`Invalid data structure for ${symbol}:`, JSON.stringify(data).substring(0, 200));
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
    const period = searchParams.get('period') || '5y';
    
    // 获取标普500数据 (^GSPC)
    const sp500Data = await fetchYahooFinance('^GSPC', period);
    
    // 获取黄金数据 (GC=F 黄金期货)
    const goldData = await fetchYahooFinance('GC=F', period);
    
    // 提取时间戳和收盘价
    const sp500Timestamps = sp500Data.timestamp;
    const sp500Prices = sp500Data.indicators.quote[0].close;
    
    const goldTimestamps = goldData.timestamp;
    const goldPrices = goldData.indicators.quote[0].close;
    
    // 创建日期映射以便对齐数据
    const goldPriceMap = new Map();
    goldTimestamps.forEach((ts: number, idx: number) => {
      const date = new Date(ts * 1000).toISOString().split('T')[0];
      goldPriceMap.set(date, goldPrices[idx]);
    });
    
    // 计算比率
    const ratioData = [];
    const validRatios = [];
    
    for (let i = 0; i < sp500Timestamps.length; i++) {
      const date = new Date(sp500Timestamps[i] * 1000).toISOString().split('T')[0];
      const sp500Price = sp500Prices[i];
      const goldPrice = goldPriceMap.get(date);
      
      if (sp500Price && goldPrice && sp500Price > 0 && goldPrice > 0) {
        const ratio = sp500Price / goldPrice;
        ratioData.push({
          date,
          timestamp: sp500Timestamps[i],
          sp500: sp500Price,
          gold: goldPrice,
          ratio
        });
        validRatios.push(ratio);
      }
    }
    
    // 计算统计数据
    const currentData = ratioData[ratioData.length - 1];
    const mean = validRatios.reduce((a, b) => a + b, 0) / validRatios.length;
    const variance = validRatios.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validRatios.length;
    const std = Math.sqrt(variance);
    const max = Math.max(...validRatios);
    const min = Math.min(...validRatios);
    
    // 历史关键时期的比率参考值
    const historicalPeaks = {
      dotComBubble2000: 5.5,  // 2000年互联网泡沫
      greatDepression1929: 18.0, // 1929年大萧条前
      financial2008: 1.5, // 2008年金融危机后低点
    };
    
    // 计算Z-score (标准分数)
    const zScore = (currentData.ratio - mean) / std;
    
    // 风险评估
    let riskLevel = '相对安全';
    let riskColor = 'green';
    let riskDescription = '当前比率处于历史正常范围内';
    
    if (zScore > 2) {
      riskLevel = '高风险';
      riskColor = 'red';
      riskDescription = '比率显著高于历史均值,股市可能存在泡沫';
    } else if (zScore > 1) {
      riskLevel = '中等风险';
      riskColor = 'yellow';
      riskDescription = '比率高于历史均值,需要关注';
    } else if (zScore < -1) {
      riskLevel = '低估值';
      riskColor = 'blue';
      riskDescription = '比率低于历史均值,可能是买入机会';
    }
    
    // 与历史峰值对比
    const vsDotComBubble = ((currentData.ratio - historicalPeaks.dotComBubble2000) / historicalPeaks.dotComBubble2000 * 100).toFixed(2);
    
    return NextResponse.json({
      success: true,
      data: {
        current: {
          date: currentData.date,
          sp500: currentData.sp500.toFixed(2),
          gold: currentData.gold.toFixed(2),
          ratio: currentData.ratio.toFixed(3),
        },
        statistics: {
          mean: mean.toFixed(3),
          std: std.toFixed(3),
          max: max.toFixed(3),
          min: min.toFixed(3),
          zScore: zScore.toFixed(2),
        },
        risk: {
          level: riskLevel,
          color: riskColor,
          description: riskDescription,
        },
        historicalComparison: {
          vsDotComBubble2000: `${vsDotComBubble}%`,
          dotComBubbleRatio: historicalPeaks.dotComBubble2000,
          currentVsDotCom: currentData.ratio < historicalPeaks.dotComBubble2000 ? '低于' : '高于',
        },
        historicalData: ratioData.slice(-365), // 最近一年的数据
        fullHistoricalData: ratioData, // 完整历史数据
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch market data' 
      },
      { status: 500 }
    );
  }
}
