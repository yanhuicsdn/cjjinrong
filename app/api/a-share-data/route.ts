import { NextResponse } from 'next/server';

// Yahoo Finance API - A股数据
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
    
    // 获取上证指数数据 (000001.SS)
    const shanghaiData = await fetchYahooFinance('000001.SS', period);
    
    // 获取黄金数据 (GC=F 黄金期货)
    const goldData = await fetchYahooFinance('GC=F', period);
    
    // 提取时间戳和收盘价
    const shanghaiTimestamps = shanghaiData.timestamp;
    const shanghaiPrices = shanghaiData.indicators.quote[0].close;
    
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
    
    for (let i = 0; i < shanghaiTimestamps.length; i++) {
      const date = new Date(shanghaiTimestamps[i] * 1000).toISOString().split('T')[0];
      const shanghaiPrice = shanghaiPrices[i];
      const goldPrice = goldPriceMap.get(date);
      
      if (shanghaiPrice && goldPrice && shanghaiPrice > 0 && goldPrice > 0) {
        const ratio = shanghaiPrice / goldPrice;
        ratioData.push({
          date,
          timestamp: shanghaiTimestamps[i],
          shanghai: shanghaiPrice,
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
    
    // A股历史关键时期的比率参考值
    const historicalPeaks = {
      bubble2007: 2.5,  // 2007年A股大牛市顶峰
      bubble2015: 2.2,  // 2015年股灾前
      crisis2008: 0.8,  // 2008年金融危机后低点
      pandemic2020: 1.2, // 2020年疫情低点
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
      riskDescription = '比率显著高于历史均值,A股可能存在泡沫';
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
    const vs2015Bubble = ((currentData.ratio - historicalPeaks.bubble2015) / historicalPeaks.bubble2015 * 100).toFixed(2);
    const vs2007Bubble = ((currentData.ratio - historicalPeaks.bubble2007) / historicalPeaks.bubble2007 * 100).toFixed(2);
    
    return NextResponse.json({
      success: true,
      data: {
        current: {
          date: currentData.date,
          shanghai: currentData.shanghai.toFixed(2),
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
          vs2015Bubble: `${vs2015Bubble}%`,
          vs2007Bubble: `${vs2007Bubble}%`,
          bubble2015Ratio: historicalPeaks.bubble2015,
          bubble2007Ratio: historicalPeaks.bubble2007,
          currentVs2015: currentData.ratio < historicalPeaks.bubble2015 ? '低于' : '高于',
          currentVs2007: currentData.ratio < historicalPeaks.bubble2007 ? '低于' : '高于',
        },
        historicalData: ratioData.slice(-365), // 最近一年的数据
        fullHistoricalData: ratioData, // 完整历史数据
      }
    });
    
  } catch (error) {
    console.error('A-Share API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch A-share data' 
      },
      { status: 500 }
    );
  }
}
