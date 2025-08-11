import { InjuryRecord, NearMissRecord, Severity, Likelihood, KPIMetrics } from '../types';
import { parse, format } from 'date-fns';

const BASELINE_HOURS = 200000; // Standard baseline for calculations

export function standardizeSeverity(severity: string): Severity {
  const normalized = severity?.toString().toUpperCase().trim();
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized as Severity;
  }
  return 'Unknown';
}

export function standardizeLikelihood(likelihood: string): Likelihood {
  const normalized = likelihood?.toLowerCase().trim();
  const mapping: Record<string, Likelihood> = {
    'rare': 'Rare',
    '1': 'Rare',
    'unlikely': 'Unlikely',
    '2': 'Unlikely',
    'possible': 'Possible',
    '3': 'Possible',
    'likely': 'Likely',
    '4': 'Likely',
    'almost certain': 'Almost Certain',
    'almost_certain': 'Almost Certain',
    'almostcertain': 'Almost Certain',
    '5': 'Almost Certain'
  };
  return mapping[normalized] || 'Possible';
}

export function calculateRiskScore(severity: Severity, likelihood: Likelihood): number {
  const severityScores: Record<Severity, number> = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'Unknown': 1
  };

  const likelihoodScores: Record<Likelihood, number> = {
    'Almost Certain': 5,
    'Likely': 4,
    'Possible': 3,
    'Unlikely': 2,
    'Rare': 1
  };

  const severityScore = severityScores[severity] || 1;
  const likelihoodScore = likelihoodScores[likelihood] || 3;
  
  return ((severityScore * likelihoodScore) / 5) * 2; // Scale 0-10
}

export function parseDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Try multiple date formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd',
    'dd-MM-yyyy',
    'MM-dd-yyyy'
  ];

  for (const fmt of formats) {
    try {
      const parsed = parse(dateString, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback to native Date parsing
  const fallback = new Date(dateString);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function calculateKPIs(
  injuryData: InjuryRecord[],
  nearMissData: NearMissRecord[]
): KPIMetrics {
  const recordableCount = injuryData.filter(d => d.recordable === 1).length;
  const lostTimeCount = injuryData.filter(d => d.otr === 'yes').length;
  const totalDAFW = injuryData.reduce((sum, d) => sum + (d.total_dafw_days || 0), 0);
  
  const riskScores = nearMissData.map(d => 
    calculateRiskScore(d.severity, d.standardized_likelihood)
  );
  const avgRiskScore = riskScores.length > 0 
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
    : 0;

  const criticalEvents = [
    ...injuryData.filter(d => d.severity === 'A' || d.severity === 'B'),
    ...nearMissData.filter(d => d.severity === 'A' || d.severity === 'B')
  ].length;

  return {
    TRIR: (recordableCount / BASELINE_HOURS) * 200000,
    LTIR: (lostTimeCount / BASELINE_HOURS) * 200000,
    DAFWR: (totalDAFW / BASELINE_HOURS) * 200000,
    NMFR: (nearMissData.length / BASELINE_HOURS) * 200000,
    totalIncidents: injuryData.length,
    recordableIncidents: recordableCount,
    lostTimeIncidents: lostTimeCount,
    nearMissCount: nearMissData.length,
    avgRiskScore,
    criticalEvents
  };
}

export function filterData<T extends InjuryRecord | NearMissRecord>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter(record => {
    // Site filter
    if (filters.site && filters.site !== 'all') {
      if (record.site !== filters.site) return false;
    }

    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      if (record.severity !== filters.severity) return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const recordDate = record.parsedDate || parseDate(
        'incident_date' in record ? record.incident_date : record.nearmiss_date
      );
      
      if (filters.dateFrom) {
        const fromDate = parseDate(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = parseDate(filters.dateTo);
        if (recordDate > toDate) return false;
      }
    }

    // Body part filter (injury only)
    if (filters.bodyPart && filters.bodyPart !== 'all' && 'bodyPart' in record) {
      if (record.bodyPart !== filters.bodyPart) return false;
    }

    // Process path filter
    if (filters.processPath && filters.processPath !== 'all') {
      if (record.processPath !== filters.processPath) return false;
    }

    return true;
  });
}

export function aggregateByMonth<T extends { parsedDate?: Date }>(
  data: T[]
): { month: string; count: number }[] {
  const monthCounts: Record<string, number> = {};

  data.forEach(record => {
    if (record.parsedDate) {
      const monthKey = format(record.parsedDate, 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  return Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: format(parse(month, 'yyyy-MM', new Date()), 'MMM yyyy'),
      count
    }));
}

export function generateColors(count: number): string[] {
  const baseColors = [
    '#FF9900', // Amazon Orange
    '#232F3E', // Amazon Dark
    '#4CAF50', // Success Green
    '#FFC107', // Warning Yellow
    '#FF5722', // Danger Red
    '#2196F3', // Info Blue
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}
