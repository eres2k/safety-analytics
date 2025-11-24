/**
 * Safety Calculations & KPI Functions
 * Preserves all calculation logic from legacy system
 */

import type {
  InjuryRecord,
  NearMissRecord,
  SafetyKPIs,
  QualityMetrics,
  TrendAnalysis,
} from '@/types';
import { parseDate, daysBetween, countWords, getTrendDateRange, isDateInRange } from './utils';

/**
 * Calculate comprehensive safety KPIs
 */
export function calculateSafetyKPIs(
  injuries: InjuryRecord[],
  nearMisses: NearMissRecord[],
  totalHours: number = 200000 // Default: 100 employees * 2000 hours/year
): SafetyKPIs {
  const recordableInjuries = injuries.filter(i => i.recordable === true).length;
  const lostTimeCases = injuries.filter(i => (i.daysAway || 0) > 0).length;

  // Core rates (per 200,000 hours)
  const trir = (recordableInjuries / totalHours) * 200000;
  const ltir = (lostTimeCases / totalHours) * 200000;

  // Days away from work rate
  const totalDaysAway = injuries.reduce((sum, i) => sum + (i.daysAway || 0), 0);
  const dafwr = (totalDaysAway / totalHours) * 200000;

  // Near miss frequency rate
  const nmfr = (nearMisses.length / totalHours) * 200000;

  // Recordable rate
  const recordableRate = (recordableInjuries / injuries.length) * 100 || 0;

  // Safety index (composite score - higher is better)
  const safetyIndex = calculateSafetyIndex(trir, ltir, nmfr);

  // Severity score (average severity)
  const severityScore = calculateAverageSeverity(injuries);

  // Trend calculations
  const trend30Days = calculateTrend(injuries, 30);
  const trend60Days = calculateTrend(injuries, 60);
  const trend90Days = calculateTrend(injuries, 90);

  // Lead and lag indicators
  const leadIndicatorScore = calculateLeadIndicatorScore(nearMisses, injuries);
  const lagIndicatorScore = calculateLagIndicatorScore(injuries);

  return {
    trir: Number(trir.toFixed(2)),
    ltir: Number(ltir.toFixed(2)),
    dafwr: Number(dafwr.toFixed(2)),
    nmfr: Number(nmfr.toFixed(2)),
    safetyIndex: Number(safetyIndex.toFixed(1)),
    recordableRate: Number(recordableRate.toFixed(1)),
    totalInjuries: injuries.length,
    recordableInjuries,
    lostTimeCases,
    nearMisses: nearMisses.length,
    trend30Days: Number(trend30Days.toFixed(1)),
    trend60Days: Number(trend60Days.toFixed(1)),
    trend90Days: Number(trend90Days.toFixed(1)),
    severityScore: Number(severityScore.toFixed(2)),
    leadIndicatorScore: Number(leadIndicatorScore.toFixed(1)),
    lagIndicatorScore: Number(lagIndicatorScore.toFixed(1)),
  };
}

/**
 * Calculate safety index (0-100, higher is better)
 */
function calculateSafetyIndex(trir: number, ltir: number, nmfr: number): number {
  // Normalize values and weight them
  const trirScore = Math.max(0, 100 - (trir * 10));
  const ltirScore = Math.max(0, 100 - (ltir * 15));
  const nmfrScore = Math.min(100, nmfr * 2); // Higher near miss reporting is good

  return (trirScore * 0.4) + (ltirScore * 0.4) + (nmfrScore * 0.2);
}

/**
 * Calculate average severity
 */
function calculateAverageSeverity(injuries: InjuryRecord[]): number {
  if (injuries.length === 0) return 0;

  const severityScores: Record<string, number> = {
    'Minor': 1,
    'Moderate': 2,
    'Serious': 3,
    'Severe': 4,
    'Critical': 5,
  };

  const total = injuries.reduce((sum, injury) => {
    return sum + (severityScores[injury.severity] || 2);
  }, 0);

  return total / injuries.length;
}

/**
 * Calculate trend (% change over period)
 */
function calculateTrend(injuries: InjuryRecord[], days: number): number {
  const { start, end } = getTrendDateRange(days);
  const currentPeriod = injuries.filter(i => {
    const date = parseDate(i.date);
    return date && isDateInRange(date, start, end);
  });

  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - days);
  const previousPeriod = injuries.filter(i => {
    const date = parseDate(i.date);
    return date && isDateInRange(date, previousStart, start);
  });

  if (previousPeriod.length === 0) return 0;

  return ((currentPeriod.length - previousPeriod.length) / previousPeriod.length) * 100;
}

/**
 * Calculate lead indicator score (proactive measures)
 */
function calculateLeadIndicatorScore(nearMisses: NearMissRecord[], injuries: InjuryRecord[]): number {
  // Near miss to injury ratio (higher is better)
  if (injuries.length === 0) return 100;

  const ratio = nearMisses.length / injuries.length;

  // Heinrich's pyramid suggests 300:29:1 (near miss : minor : serious)
  // Ideal ratio is > 10:1
  if (ratio >= 10) return 100;
  if (ratio >= 5) return 80;
  if (ratio >= 3) return 60;
  if (ratio >= 1) return 40;
  return 20;
}

/**
 * Calculate lag indicator score (reactive measures)
 */
function calculateLagIndicatorScore(injuries: InjuryRecord[]): number {
  if (injuries.length === 0) return 100;

  // Score based on severity distribution
  const minor = injuries.filter(i => i.severity === 'Minor').length;
  const total = injuries.length;

  // Higher percentage of minor vs serious is better
  return Math.min(100, (minor / total) * 100);
}

/**
 * Calculate data quality metrics
 */
export function calculateQualityMetrics<T extends Record<string, unknown>>(
  data: T[],
  requiredFields: string[]
): QualityMetrics {
  if (data.length === 0) {
    return {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      timeliness: 0,
      overallScore: 0,
      missingFields: [],
      duplicateCount: 0,
      avgWordCount: 0,
      recordsAssessed: 0,
    };
  }

  // Completeness: % of required fields filled
  let totalFields = 0;
  let filledFields = 0;
  const missingFieldSet = new Set<string>();

  data.forEach(record => {
    requiredFields.forEach(field => {
      totalFields++;
      const value = record[field];
      if (value && value !== '' && value !== null && value !== undefined) {
        filledFields++;
      } else {
        missingFieldSet.add(field);
      }
    });
  });

  const completeness = (filledFields / totalFields) * 100;
  const missingFields = Array.from(missingFieldSet);

  // Accuracy: word count in description fields
  const descriptionFields = ['description', 'rootCause', 'correctiveAction', 'potentialImpact'];
  let totalWordCount = 0;
  let descriptiveRecords = 0;

  data.forEach(record => {
    descriptionFields.forEach(field => {
      const text = String(record[field] || '');
      if (text) {
        totalWordCount += countWords(text);
        descriptiveRecords++;
      }
    });
  });

  const avgWordCount = descriptiveRecords > 0 ? totalWordCount / descriptiveRecords : 0;
  const accuracy = Math.min(100, (avgWordCount / 20) * 100); // 20 words = 100% accuracy

  // Consistency: check for duplicates
  const duplicates = findDuplicates(data);
  const consistency = Math.max(0, 100 - (duplicates.length / data.length) * 100);

  // Timeliness: check reporting delay (if applicable)
  let timeliness = 100;
  if ('date' in data[0] && 'dateReported' in data[0]) {
    const delays = data
      .filter(record => record.date && record.dateReported)
      .map(record => {
        const incident = parseDate(record.date as string);
        const reported = parseDate(record.dateReported as string);
        if (!incident || !reported) return 0;
        return daysBetween(incident, reported);
      });

    if (delays.length > 0) {
      const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;
      timeliness = Math.max(0, 100 - (avgDelay * 10)); // Each day delay reduces score by 10
    }
  }

  const overallScore = (completeness * 0.3) + (accuracy * 0.3) + (consistency * 0.2) + (timeliness * 0.2);

  return {
    completeness: Number(completeness.toFixed(1)),
    accuracy: Number(accuracy.toFixed(1)),
    consistency: Number(consistency.toFixed(1)),
    timeliness: Number(timeliness.toFixed(1)),
    overallScore: Number(overallScore.toFixed(1)),
    missingFields,
    duplicateCount: duplicates.length,
    avgWordCount: Number(avgWordCount.toFixed(1)),
    recordsAssessed: data.length,
  };
}

/**
 * Find duplicate records
 */
function findDuplicates<T extends Record<string, unknown>>(data: T[]): T[] {
  const seen = new Set<string>();
  const duplicates: T[] = [];

  data.forEach(record => {
    // Create a key from core fields
    const key = JSON.stringify({
      site: record.site,
      date: record.date,
      description: String(record.description || '').substring(0, 50),
    });

    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      seen.add(key);
    }
  });

  return duplicates;
}

/**
 * Analyze trends with prediction
 */
export function analyzeTrend(
  values: number[],
  metric: string
): TrendAnalysis {
  if (values.length < 2) {
    return {
      metric,
      direction: 'stable',
      changePercent: 0,
      prediction: values[0] || 0,
      confidence: 0,
      factors: [],
    };
  }

  // Calculate linear regression
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xSum = xValues.reduce((a, b) => a + b, 0);
  const ySum = values.reduce((a, b) => a + b, 0);
  const xMean = xSum / n;
  const yMean = ySum / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (values[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Predict next value
  const prediction = slope * n + intercept;

  // Calculate confidence based on R²
  const yPredicted = xValues.map(x => slope * x + intercept);
  const ssRes = values.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
  const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  // Determine direction
  const changePercent = yMean !== 0 ? ((prediction - yMean) / yMean) * 100 : 0;
  let direction: 'improving' | 'stable' | 'worsening' = 'stable';

  if (Math.abs(changePercent) > 5) {
    // For injury metrics, decreasing is improving
    direction = changePercent < 0 ? 'improving' : 'worsening';
  }

  return {
    metric,
    direction,
    changePercent: Number(changePercent.toFixed(1)),
    prediction: Number(prediction.toFixed(2)),
    confidence: Number(confidence.toFixed(1)),
    factors: identifyTrendFactors(values, direction),
  };
}

/**
 * Identify factors contributing to trend
 */
function identifyTrendFactors(values: number[], direction: TrendAnalysis['direction']): string[] {
  const factors: string[] = [];

  // Check for volatility
  const volatility = calculateVolatility(values);
  if (volatility > 0.3) {
    factors.push('High variability in data');
  }

  // Check for recent changes
  if (values.length >= 3) {
    const recentChange = values[values.length - 1] - values[values.length - 2];
    const previousChange = values[values.length - 2] - values[values.length - 3];

    if (Math.sign(recentChange) !== Math.sign(previousChange)) {
      factors.push('Trend reversal detected');
    }
  }

  // Add direction-specific factors
  if (direction === 'worsening') {
    factors.push('Increasing incident rate');
    factors.push('Review control measures');
  } else if (direction === 'improving') {
    factors.push('Positive safety trend');
    factors.push('Continue current practices');
  }

  return factors;
}

/**
 * Calculate volatility (standard deviation / mean)
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return mean !== 0 ? stdDev / mean : 0;
}

/**
 * Calculate risk matrix data
 */
export function calculateRiskMatrix<T extends { severity: string; likelihood?: string }>(
  data: T[]
): Array<{ severity: number; likelihood: number; count: number; items: T[] }> {
  const matrix: Map<string, { severity: number; likelihood: number; count: number; items: T[] }> = new Map();

  const severityMap: Record<string, number> = {
    'Minor': 1,
    'Moderate': 2,
    'Serious': 3,
    'Severe': 4,
    'Critical': 5,
  };

  const likelihoodMap: Record<string, number> = {
    'Rare': 1,
    'Unlikely': 2,
    'Possible': 3,
    'Likely': 4,
    'Almost Certain': 5,
  };

  data.forEach(item => {
    const severity = severityMap[item.severity] || 3;
    const likelihood = item.likelihood ? likelihoodMap[item.likelihood] || 3 : 3;
    const key = `${severity}-${likelihood}`;

    if (!matrix.has(key)) {
      matrix.set(key, { severity, likelihood, count: 0, items: [] });
    }

    const cell = matrix.get(key)!;
    cell.count++;
    cell.items.push(item);
  });

  return Array.from(matrix.values());
}

/**
 * Calculate frequency distribution
 */
export function calculateFrequency<T>(
  data: T[],
  field: keyof T
): Array<{ label: string; count: number; percentage: number }> {
  const frequency = new Map<string, number>();

  data.forEach(item => {
    const value = String(item[field] || 'Unknown');
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  const total = data.length;
  return Array.from(frequency.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}
