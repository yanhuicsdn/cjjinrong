import { NextResponse } from 'next/server';

/**
 * 市场泡沫指数计算
 * 综合多个指标计算一个0-100的泡沫指数
 */

interface BubbleIndexData {
  index: number; // 0-100的泡沫指数
  level: string; // 风险等级
  color: string; // 颜色
  description: string; // 描述
  components: {
    ratioScore: number; // SP500/黄金比率得分
    zScoreScore: number; // Z-Score得分
    spreadScore: number; // 利差得分
    historicalScore: number; // 历史对比得分
  };
  breakdown: string[]; // 详细分析
  recommendation: string; // 投资建议
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取必要的参数
    const ratio = parseFloat(searchParams.get('ratio') || '0');
    const zScore = parseFloat(searchParams.get('zScore') || '0');
    const mean = parseFloat(searchParams.get('mean') || '0');
    const max = parseFloat(searchParams.get('max') || '0');
    const spreadTrend = parseFloat(searchParams.get('spreadTrend') || '0');
    
    if (!ratio || !mean || !max) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // 1. SP500/黄金比率得分 (0-30分)
    // 基于当前比率相对历史最大值的位置
    const ratioScore = calculateRatioScore(ratio, mean, max);
    
    // 2. Z-Score得分 (0-30分)
    // 基于标准分数
    const zScoreScore = calculateZScoreScore(zScore);
    
    // 3. 利差趋势得分 (0-20分)
    // 基于30日利差变化
    const spreadScore = calculateSpreadScore(spreadTrend);
    
    // 4. 历史对比得分 (0-20分)
    // 与历史关键时期对比
    const historicalScore = calculateHistoricalScore(ratio);
    
    // 计算总分 (0-100)
    const totalScore = ratioScore + zScoreScore + spreadScore + historicalScore;
    
    // 确定风险等级
    const { level, color, description } = getRiskLevel(totalScore);
    
    // 生成详细分析
    const breakdown = generateBreakdown(ratioScore, zScoreScore, spreadScore, historicalScore, ratio, zScore);
    
    // 生成投资建议
    const recommendation = generateRecommendation(totalScore);
    
    const result: BubbleIndexData = {
      index: Math.round(totalScore),
      level,
      color,
      description,
      components: {
        ratioScore: Math.round(ratioScore),
        zScoreScore: Math.round(zScoreScore),
        spreadScore: Math.round(spreadScore),
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
    console.error('Bubble Index API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate bubble index' 
      },
      { status: 500 }
    );
  }
}

// 计算比率得分 (0-30分)
function calculateRatioScore(ratio: number, mean: number, max: number): number {
  // 比率越高,得分越高(风险越大)
  const percentOfMax = (ratio / max) * 100;
  const percentOfMean = (ratio / mean) * 100;
  
  let score = 0;
  
  // 基于相对最大值的位置 (0-15分)
  if (percentOfMax > 90) score += 15;
  else if (percentOfMax > 80) score += 13;
  else if (percentOfMax > 70) score += 11;
  else if (percentOfMax > 60) score += 9;
  else if (percentOfMax > 50) score += 7;
  else if (percentOfMax > 40) score += 5;
  else if (percentOfMax > 30) score += 3;
  else score += 1;
  
  // 基于相对均值的位置 (0-15分)
  if (percentOfMean > 150) score += 15;
  else if (percentOfMean > 130) score += 12;
  else if (percentOfMean > 110) score += 9;
  else if (percentOfMean > 90) score += 6;
  else if (percentOfMean > 70) score += 3;
  else score += 0;
  
  return Math.min(score, 30);
}

// 计算Z-Score得分 (0-30分)
function calculateZScoreScore(zScore: number): number {
  // Z-Score越高,得分越高(风险越大)
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
  else score = 0; // Z-Score < -1 表示低估,风险低
  
  return score;
}

// 计算利差得分 (0-20分)
function calculateSpreadScore(spreadTrend: number): number {
  // 利差扩大(正值)表示风险上升
  let score = 0;
  
  if (spreadTrend > 0.5) score = 20;
  else if (spreadTrend > 0.3) score = 16;
  else if (spreadTrend > 0.2) score = 12;
  else if (spreadTrend > 0.1) score = 8;
  else if (spreadTrend > 0) score = 4;
  else if (spreadTrend > -0.1) score = 2;
  else score = 0; // 利差收窄,风险较低
  
  return score;
}

// 计算历史对比得分 (0-20分)
function calculateHistoricalScore(ratio: number): number {
  // 与历史关键时期对比
  const dotComBubble = 5.5; // 2000年互联网泡沫
  // const crisis2008Low = 1.5; // 2008年金融危机低点 (保留供未来使用)
  // const greatDepression = 18.0; // 1929年大萧条 (保留供未来使用)
  
  let score = 0;
  
  // 与2000年泡沫对比
  const vsDotCom = (ratio / dotComBubble) * 100;
  if (vsDotCom > 100) score += 20; // 超过2000年泡沫
  else if (vsDotCom > 90) score += 18;
  else if (vsDotCom > 80) score += 15;
  else if (vsDotCom > 70) score += 12;
  else if (vsDotCom > 60) score += 9;
  else if (vsDotCom > 50) score += 6;
  else if (vsDotCom > 40) score += 3;
  else score += 0;
  
  return Math.min(score, 20);
}

// 确定风险等级
function getRiskLevel(score: number): { level: string; color: string; description: string } {
  if (score >= 80) {
    return {
      level: '极度危险',
      color: 'red',
      description: '市场处于极度泡沫状态,建议大幅减仓或清仓'
    };
  } else if (score >= 65) {
    return {
      level: '高度风险',
      color: 'orange',
      description: '市场存在明显泡沫,建议减仓至30-40%'
    };
  } else if (score >= 50) {
    return {
      level: '中度风险',
      color: 'yellow',
      description: '市场有泡沫迹象,建议保持50-60%仓位'
    };
  } else if (score >= 35) {
    return {
      level: '轻度风险',
      color: 'blue',
      description: '市场估值偏高,建议保持谨慎,60-70%仓位'
    };
  } else if (score >= 20) {
    return {
      level: '相对安全',
      color: 'green',
      description: '市场估值合理,可保持正常仓位70-80%'
    };
  } else {
    return {
      level: '低估值区域',
      color: 'teal',
      description: '市场可能被低估,可考虑逐步加仓'
    };
  }
}

// 生成详细分析
function generateBreakdown(
  ratioScore: number,
  zScoreScore: number,
  spreadScore: number,
  historicalScore: number,
  ratio: number,
  zScore: number
): string[] {
  const breakdown: string[] = [];
  
  // 比率分析
  if (ratioScore >= 20) {
    breakdown.push(`📊 SP500/黄金比率(${ratio.toFixed(3)})处于历史高位,占比${ratioScore}/30分`);
  } else if (ratioScore >= 10) {
    breakdown.push(`📊 SP500/黄金比率(${ratio.toFixed(3)})偏高,占比${ratioScore}/30分`);
  } else {
    breakdown.push(`📊 SP500/黄金比率(${ratio.toFixed(3)})相对合理,占比${ratioScore}/30分`);
  }
  
  // Z-Score分析
  if (zScoreScore >= 20) {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})显著偏离均值,占比${zScoreScore}/30分`);
  } else if (zScoreScore >= 10) {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})高于均值,占比${zScoreScore}/30分`);
  } else {
    breakdown.push(`📈 Z-Score(${zScore.toFixed(2)})在正常范围,占比${zScoreScore}/30分`);
  }
  
  // 利差分析
  if (spreadScore >= 12) {
    breakdown.push(`💰 债券利差快速扩大,市场风险偏好下降,占比${spreadScore}/20分`);
  } else if (spreadScore >= 6) {
    breakdown.push(`💰 债券利差温和上升,需要关注,占比${spreadScore}/20分`);
  } else {
    breakdown.push(`💰 债券利差相对稳定,占比${spreadScore}/20分`);
  }
  
  // 历史对比分析
  if (historicalScore >= 15) {
    breakdown.push(`📚 当前比率接近或超过历史泡沫水平,占比${historicalScore}/20分`);
  } else if (historicalScore >= 8) {
    breakdown.push(`📚 当前比率高于历史平均水平,占比${historicalScore}/20分`);
  } else {
    breakdown.push(`📚 当前比率低于历史泡沫水平,占比${historicalScore}/20分`);
  }
  
  return breakdown;
}

// 生成投资建议
function generateRecommendation(score: number): string {
  if (score >= 80) {
    return '🚨 强烈建议: 立即减仓至20-30%或清仓,保留现金等待机会。历史数据显示,当指数超过80时,市场往往在6-12个月内出现重大调整。';
  } else if (score >= 65) {
    return '⚠️ 建议: 减仓至30-40%,增加防御性资产(债券、黄金)配置。设置止损位,避免追高。';
  } else if (score >= 50) {
    return '⚡ 建议: 保持50-60%仓位,停止加仓,密切关注市场变化。考虑获利了结部分高估值股票。';
  } else if (score >= 35) {
    return '💡 建议: 保持60-70%仓位,谨慎选股,避免高估值板块。可适当配置价值股。';
  } else if (score >= 20) {
    return '✅ 建议: 保持70-80%正常仓位,可继续持有优质资产,但需分散投资。';
  } else {
    return '🎯 建议: 市场可能被低估,可考虑逐步加仓至80-90%。但仍需分批建仓,不要一次性全仓。';
  }
}
