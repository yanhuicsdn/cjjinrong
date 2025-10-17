import { NextResponse } from 'next/server';

/**
 * A股市场泡沫指数计算
 * 综合多个指标计算一个0-100的泡沫指数
 */

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const ratio = parseFloat(searchParams.get('ratio') || '0');
    const zScore = parseFloat(searchParams.get('zScore') || '0');
    const mean = parseFloat(searchParams.get('mean') || '0');
    const max = parseFloat(searchParams.get('max') || '0');
    const volatility = parseFloat(searchParams.get('volatility') || '0');
    
    if (!ratio || !mean || !max) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // 1. 上证指数/黄金比率得分 (0-30分)
    const ratioScore = calculateRatioScore(ratio, mean, max);
    
    // 2. Z-Score得分 (0-30分)
    const zScoreScore = calculateZScoreScore(zScore);
    
    // 3. 波动率得分 (0-20分) - A股特有
    const volatilityScore = calculateVolatilityScore(volatility);
    
    // 4. 历史对比得分 (0-20分)
    const historicalScore = calculateHistoricalScore(ratio);
    
    // 计算总分
    const totalScore = ratioScore + zScoreScore + volatilityScore + historicalScore;
    
    const { level, color, description } = getRiskLevel(totalScore);
    const breakdown = generateBreakdown(ratioScore, zScoreScore, volatilityScore, historicalScore, ratio, zScore, volatility);
    const recommendation = generateRecommendation(totalScore);
    
    const result: BubbleIndexData = {
      index: Math.round(totalScore),
      level,
      color,
      description,
      components: {
        ratioScore: Math.round(ratioScore),
        zScoreScore: Math.round(zScoreScore),
        volatilityScore: Math.round(volatilityScore),
        historicalScore: Math.round(historicalScore)
      },
      breakdown,
      recommendation
    };
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('A-Share Bubble Index API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate bubble index' 
      },
      { status: 500 }
    );
  }
}

function calculateRatioScore(ratio: number, mean: number, max: number): number {
  const percentOfMax = (ratio / max) * 100;
  const percentOfMean = (ratio / mean) * 100;
  
  let score = 0;
  
  if (percentOfMax > 90) score += 15;
  else if (percentOfMax > 80) score += 13;
  else if (percentOfMax > 70) score += 11;
  else if (percentOfMax > 60) score += 9;
  else if (percentOfMax > 50) score += 7;
  else if (percentOfMax > 40) score += 5;
  else score += 3;
  
  if (percentOfMean > 150) score += 15;
  else if (percentOfMean > 130) score += 12;
  else if (percentOfMean > 110) score += 9;
  else if (percentOfMean > 90) score += 6;
  else if (percentOfMean > 70) score += 3;
  
  return Math.min(score, 30);
}

function calculateZScoreScore(zScore: number): number {
  let score = 0;
  
  if (zScore > 3) score = 30;
  else if (zScore > 2.5) score = 27;
  else if (zScore > 2) score = 24;
  else if (zScore > 1.5) score = 20;
  else if (zScore > 1) score = 15;
  else if (zScore > 0.5) score = 10;
  else if (zScore > 0) score = 5;
  else if (zScore > -0.5) score = 3;
  else if (zScore > -1) score = 1;
  else score = 0;
  
  return score;
}

function calculateVolatilityScore(volatility: number): number {
  // A股特有: 波动率越高,风险越大
  let score = 0;
  
  if (volatility > 40) score = 20;
  else if (volatility > 35) score = 18;
  else if (volatility > 30) score = 16;
  else if (volatility > 25) score = 14;
  else if (volatility > 20) score = 12;
  else if (volatility > 18) score = 10;
  else if (volatility > 15) score = 8;
  else if (volatility > 12) score = 6;
  else if (volatility > 10) score = 4;
  else score = 2;
  
  return score;
}

function calculateHistoricalScore(ratio: number): number {
  const bubble2015 = 2.2; // 2015年股灾前
  // const bubble2007 = 2.5; // 2007年大牛市 (保留供未来使用)
  
  let score = 0;
  
  const vs2015 = (ratio / bubble2015) * 100;
  if (vs2015 > 100) score += 20;
  else if (vs2015 > 90) score += 18;
  else if (vs2015 > 80) score += 15;
  else if (vs2015 > 70) score += 12;
  else if (vs2015 > 60) score += 9;
  else if (vs2015 > 50) score += 6;
  else if (vs2015 > 40) score += 3;
  
  return Math.min(score, 20);
}

function getRiskLevel(score: number): { level: string; color: string; description: string } {
  if (score >= 80) {
    return {
      level: '极度危险',
      color: 'red',
      description: 'A股处于极度泡沫状态,建议大幅减仓或清仓'
    };
  } else if (score >= 65) {
    return {
      level: '高度风险',
      color: 'orange',
      description: 'A股存在明显泡沫,建议减仓至30-40%'
    };
  } else if (score >= 50) {
    return {
      level: '中度风险',
      color: 'yellow',
      description: 'A股有泡沫迹象,建议保持50-60%仓位'
    };
  } else if (score >= 35) {
    return {
      level: '轻度风险',
      color: 'blue',
      description: 'A股估值偏高,建议保持谨慎,60-70%仓位'
    };
  } else if (score >= 20) {
    return {
      level: '相对安全',
      color: 'green',
      description: 'A股估值合理,可保持正常仓位70-80%'
    };
  } else {
    return {
      level: '低估值区域',
      color: 'teal',
      description: 'A股可能被低估,可考虑逐步加仓'
    };
  }
}

function generateBreakdown(
  ratioScore: number,
  zScoreScore: number,
  volatilityScore: number,
  historicalScore: number,
  ratio: number,
  zScore: number,
  volatility: number
): string[] {
  const breakdown: string[] = [];
  
  if (ratioScore >= 20) {
    breakdown.push(`📊 上证指数/黄金比率(${ratio.toFixed(3)})处于历史高位,占比${ratioScore}/30分`);
  } else if (ratioScore >= 10) {
    breakdown.push(`📊 上证指数/黄金比率(${ratio.toFixed(3)})偏高,占比${ratioScore}/30分`);
  } else {
    breakdown.push(`📊 上证指数/黄金比率(${ratio.toFixed(3)})相对合理,占比${ratioScore}/30分`);
  }
  
  if (zScoreScore >= 20) {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})显著偏离均值,占比${zScoreScore}/30分`);
  } else if (zScoreScore >= 10) {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})高于均值,占比${zScoreScore}/30分`);
  } else {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})在正常范围,占比${zScoreScore}/30分`);
  }
  
  if (volatilityScore >= 14) {
    breakdown.push(`📊 市场波动率(${volatility.toFixed(2)}%)较高,情绪不稳定,占比${volatilityScore}/20分`);
  } else if (volatilityScore >= 8) {
    breakdown.push(`📊 市场波动率(${volatility.toFixed(2)}%)中等,占比${volatilityScore}/20分`);
  } else {
    breakdown.push(`📊 市场波动率(${volatility.toFixed(2)}%)较低,相对平稳,占比${volatilityScore}/20分`);
  }
  
  if (historicalScore >= 15) {
    breakdown.push(`📚 当前比率接近2015年或2007年泡沫水平,占比${historicalScore}/20分`);
  } else if (historicalScore >= 8) {
    breakdown.push(`📚 当前比率高于历史平均水平,占比${historicalScore}/20分`);
  } else {
    breakdown.push(`📚 当前比率低于历史泡沫水平,占比${historicalScore}/20分`);
  }
  
  return breakdown;
}

function generateRecommendation(score: number): string {
  if (score >= 80) {
    return '🚨 强烈建议: 立即减仓至20-30%或清仓,保留现金等待机会。A股历史上多次出现快速上涨后的暴跌,当指数超过80时风险极高。';
  } else if (score >= 65) {
    return '⚠️ 建议: 减仓至30-40%,增加防御性资产配置。A股波动较大,建议设置止损位,避免追高。';
  } else if (score >= 50) {
    return '⚡ 建议: 保持50-60%仓位,停止加仓,密切关注政策和市场情绪变化。考虑获利了结部分高估值股票。';
  } else if (score >= 35) {
    return '💡 建议: 保持60-70%仓位,谨慎选股,关注业绩稳定的蓝筹股和价值股,避免题材炒作。';
  } else if (score >= 20) {
    return '✅ 建议: 保持70-80%正常仓位,可继续持有优质资产,但需分散投资,关注政策导向。';
  } else {
    return '🎯 建议: A股可能被低估,可考虑逐步加仓至80-90%。但仍需分批建仓,关注政策底和市场底的确认信号。';
  }
}
