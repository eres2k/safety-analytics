/**
 * Intelligent Features
 * Context-aware analytics, predictions, and smart recommendations
 */

import type {
  InjuryRecord,
  NearMissRecord,
  PredictiveInsight,
  SmartRecommendation,
  
} from '@/types';
import {
  calculateRiskScore,
  
  groupBy,
  parseDate,
  getTrendDateRange,
  isDateInRange,
  generateId,
} from './utils';
import { analyzeTrend, calculateFrequency } from './calculations';
import Fuse from 'fuse.js';

/**
 * Generate predictive insights from safety data
 */
export function generatePredictiveInsights(
  injuries: InjuryRecord[],
  nearMisses: NearMissRecord[]
): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  // Insight 1: High-risk area detection
  const highRiskAreas = identifyHighRiskAreas(injuries, nearMisses);
  if (highRiskAreas.length > 0) {
    insights.push({
      id: generateId(),
      type: 'risk-prediction',
      severity: 'critical',
      title: 'High-Risk Areas Identified',
      description: `${highRiskAreas.length} location(s) showing elevated incident rates: ${highRiskAreas.slice(0, 3).join(', ')}`,
      confidence: 85,
      relatedData: highRiskAreas,
      suggestedActions: [
        'Conduct safety audits in identified areas',
        'Review and update risk assessments',
        'Implement additional control measures',
        'Increase supervisor presence',
      ],
      timestamp: new Date(),
    });
  }

  // Insight 2: Trend deterioration
  const { start, end } = getTrendDateRange(30);
  const recentInjuries = injuries.filter(i => {
    const date = parseDate(i.date);
    return date && isDateInRange(date, start, end);
  });

  if (recentInjuries.length > injuries.length * 0.4) {
    insights.push({
      id: generateId(),
      type: 'trend-alert',
      severity: 'warning',
      title: 'Increasing Incident Trend',
      description: '40% of incidents occurred in the last 30 days, indicating a concerning trend',
      confidence: 90,
      relatedData: ['trend-increase'],
      suggestedActions: [
        'Investigate recent operational changes',
        'Review training effectiveness',
        'Conduct safety stand-down meetings',
        'Analyze common factors in recent incidents',
      ],
      timestamp: new Date(),
    });
  }

  // Insight 3: Pattern detection - similar incidents
  const patterns = detectIncidentPatterns(injuries);
  if (patterns.length > 0) {
    insights.push({
      id: generateId(),
      type: 'pattern-detection',
      severity: 'warning',
      title: 'Recurring Incident Patterns',
      description: `${patterns.length} pattern(s) detected in incident data suggesting systemic issues`,
      confidence: 75,
      relatedData: patterns,
      suggestedActions: [
        'Investigate root causes of recurring patterns',
        'Update standard operating procedures',
        'Implement preventive measures',
        'Conduct targeted training',
      ],
      timestamp: new Date(),
    });
  }

  // Insight 4: Near miss ratio analysis
  const nmRatio = injuries.length > 0 ? nearMisses.length / injuries.length : 0;
  if (nmRatio < 3) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      severity: 'info',
      title: 'Low Near Miss Reporting',
      description: 'Near miss to injury ratio is below optimal levels, suggesting underreporting',
      confidence: 70,
      relatedData: ['reporting-culture'],
      suggestedActions: [
        'Launch near miss awareness campaign',
        'Simplify reporting process',
        'Recognize and reward proactive reporting',
        'Communicate importance of near miss data',
      ],
      timestamp: new Date(),
    });
  }

  // Insight 5: Severe incident prediction
  const severePrediction = predictSevereIncident(injuries);
  if (severePrediction.risk > 60) {
    insights.push({
      id: generateId(),
      type: 'risk-prediction',
      severity: 'critical',
      title: 'Elevated Risk of Severe Incident',
      description: `Analysis suggests ${severePrediction.risk}% likelihood of severe incident in next 30 days`,
      confidence: severePrediction.confidence,
      relatedData: severePrediction.factors,
      suggestedActions: [
        'Increase safety inspections',
        'Review high-risk activities',
        'Conduct safety refresher training',
        'Implement additional monitoring',
      ],
      timestamp: new Date(),
    });
  }

  return insights.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Identify high-risk areas based on incident concentration
 */
function identifyHighRiskAreas(
  injuries: InjuryRecord[],
  nearMisses: NearMissRecord[]
): string[] {
  const allIncidents = [
    ...injuries.map(i => ({ location: i.location, severity: i.severity })),
    ...nearMisses.map(n => ({ location: n.location, severity: n.severity })),
  ];

  const locationGroups = groupBy(allIncidents, 'location');
  const highRisk: string[] = [];

  Object.entries(locationGroups).forEach(([location, incidents]) => {
    if (incidents.length < 3) return; // Need minimum incidents for statistical relevance

    const avgRisk = incidents.reduce((sum, inc) => {
      return sum + calculateRiskScore(inc.severity);
    }, 0) / incidents.length;

    if (avgRisk > 8) {
      highRisk.push(location);
    }
  });

  return highRisk;
}

/**
 * Detect recurring patterns in incidents
 */
function detectIncidentPatterns(injuries: InjuryRecord[]): string[] {
  const patterns: string[] = [];

  // Pattern 1: Same body part, same process path
  const bodyPartProcess = groupBy(
    injuries.map(i => ({
      key: `${i.bodyPart}-${i.processPath}`,
      bodyPart: i.bodyPart,
      processPath: i.processPath,
    })),
    'key'
  );

  Object.entries(bodyPartProcess).forEach(([_, items]) => {
    if (items.length >= 3) {
      patterns.push(`${items[0].bodyPart} injuries in ${items[0].processPath} (${items.length} occurrences)`);
    }
  });

  // Pattern 2: Similar incident types at same site
  const siteType = groupBy(
    injuries.map(i => ({
      key: `${i.site}-${i.incidentType}`,
      site: i.site,
      incidentType: i.incidentType,
    })),
    'key'
  );

  Object.entries(siteType).forEach(([_, items]) => {
    if (items.length >= 3) {
      patterns.push(`${items[0].incidentType} at ${items[0].site} (${items.length} occurrences)`);
    }
  });

  return patterns;
}

/**
 * Predict likelihood of severe incident
 */
function predictSevereIncident(injuries: InjuryRecord[]): {
  risk: number;
  confidence: number;
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  // Factor 1: Recent severe incidents
  const { start, end } = getTrendDateRange(60);
  const recentSevere = injuries.filter(i => {
    const date = parseDate(i.date);
    const isSevere = ['Severe', 'Critical'].includes(i.severity);
    return date && isDateInRange(date, start, end) && isSevere;
  });

  if (recentSevere.length > 0) {
    riskScore += 30;
    factors.push(`${recentSevere.length} severe incident(s) in last 60 days`);
  }

  // Factor 2: Increasing trend
  const monthlyCount = calculateMonthlyTrend(injuries);
  if (monthlyCount.length >= 3) {
    const trend = analyzeTrend(monthlyCount, 'incidents');
    if (trend.direction === 'worsening') {
      riskScore += 25;
      factors.push('Worsening incident trend');
    }
  }

  // Factor 3: High-risk activities
  const highRiskTypes = ['Falls', 'Struck by', 'Caught in/between', 'Electrical'];
  const highRiskCount = injuries.filter(i =>
    highRiskTypes.some(type => i.incidentType.includes(type))
  ).length;

  if (highRiskCount > injuries.length * 0.3) {
    riskScore += 20;
    factors.push('High proportion of high-risk incident types');
  }

  // Factor 4: Low near miss reporting
  // This would require near miss data, which we don't have in this function
  // Leaving as potential enhancement

  const confidence = Math.min(90, factors.length * 25 + 10);

  return {
    risk: Math.min(100, riskScore),
    confidence,
    factors,
  };
}

/**
 * Calculate monthly incident trend
 */
function calculateMonthlyTrend(injuries: InjuryRecord[]): number[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyCount: number[] = [];

  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(sixMonthsAgo);
    monthStart.setMonth(monthStart.getMonth() + i);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const count = injuries.filter(injury => {
      const date = parseDate(injury.date);
      return date && isDateInRange(date, monthStart, monthEnd);
    }).length;

    monthlyCount.push(count);
  }

  return monthlyCount;
}

/**
 * Generate smart recommendations based on data analysis
 */
export function generateSmartRecommendations(
  injuries: InjuryRecord[],
  nearMisses: NearMissRecord[]
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // Recommendation 1: Focus areas based on frequency
  const locationFreq = calculateFrequency(injuries, 'location');
  if (locationFreq.length > 0 && locationFreq[0].count >= 5) {
    recommendations.push({
      id: generateId(),
      category: 'Focus Area',
      recommendation: `Prioritize safety improvements in ${locationFreq[0].label}`,
      reasoning: `This location accounts for ${locationFreq[0].percentage.toFixed(1)}% of all incidents (${locationFreq[0].count} incidents)`,
      priority: 1,
      impact: 'high',
      implementationEffort: 'medium',
    });
  }

  // Recommendation 2: Training needs
  const bodyPartFreq = calculateFrequency(injuries, 'bodyPart');
  if (bodyPartFreq.length > 0 && bodyPartFreq[0].count >= 3) {
    recommendations.push({
      id: generateId(),
      category: 'Training',
      recommendation: `Develop targeted training for preventing ${bodyPartFreq[0].label} injuries`,
      reasoning: `${bodyPartFreq[0].label} injuries are the most common, occurring ${bodyPartFreq[0].count} times`,
      priority: 2,
      impact: 'high',
      implementationEffort: 'low',
    });
  }

  // Recommendation 3: Process improvements
  const processFreq = calculateFrequency(injuries, 'processPath');
  if (processFreq.length > 0 && processFreq[0].count >= 4) {
    recommendations.push({
      id: generateId(),
      category: 'Process Improvement',
      recommendation: `Review and improve safety controls in ${processFreq[0].label} process`,
      reasoning: `This process path has the highest incident rate with ${processFreq[0].count} incidents`,
      priority: 1,
      impact: 'high',
      implementationEffort: 'high',
    });
  }

  // Recommendation 4: Investigation quality
  const poorDescriptions = injuries.filter(i => {
    const descLength = (i.description || '').split(' ').length;
    return descLength < 10;
  });

  if (poorDescriptions.length > injuries.length * 0.3) {
    recommendations.push({
      id: generateId(),
      category: 'Data Quality',
      recommendation: 'Improve incident investigation documentation quality',
      reasoning: `${poorDescriptions.length} incidents (${((poorDescriptions.length / injuries.length) * 100).toFixed(0)}%) have insufficient description detail`,
      priority: 3,
      impact: 'medium',
      implementationEffort: 'low',
    });
  }

  // Recommendation 5: Near miss promotion
  const nmRatio = injuries.length > 0 ? nearMisses.length / injuries.length : 0;
  if (nmRatio < 5) {
    recommendations.push({
      id: generateId(),
      category: 'Safety Culture',
      recommendation: 'Promote near miss reporting to strengthen safety culture',
      reasoning: `Current near miss ratio (${nmRatio.toFixed(1)}:1) is below industry best practice (10:1)`,
      priority: 2,
      impact: 'high',
      implementationEffort: 'medium',
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Smart search with fuzzy matching
 */
export function createSmartSearch<T>(data: T[], searchKeys: string[]) {
  const fuse = new Fuse(data, {
    keys: searchKeys,
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return {
    search: (query: string): T[] => {
      if (!query || query.trim() === '') return data;

      const results = fuse.search(query);
      return results.map(result => result.item);
    },
    getSuggestions: (query: string, limit: number = 5): string[] => {
      if (!query || query.trim() === '') return [];

      const results = fuse.search(query);
      return results
        .slice(0, limit)
        .map(result => {
          // Extract the matching field value
          const item = result.item as Record<string, unknown>;
          for (const key of searchKeys) {
            const value = item[key];
            if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
              return value;
            }
          }
          return String(item[searchKeys[0]] || '');
        })
        .filter((value, index, self) => self.indexOf(value) === index);
    },
  };
}

/**
 * Auto-categorize incidents using text analysis
 */
export function autoCategorizeIncident(description: string, rootCause?: string): {
  suggestedCategory: string;
  confidence: number;
  keywords: string[];
} {
  const text = `${description} ${rootCause || ''}`.toLowerCase();

  const categories = [
    {
      name: 'Slip/Trip/Fall',
      keywords: ['slip', 'trip', 'fall', 'floor', 'wet', 'stairs', 'ladder'],
    },
    {
      name: 'Ergonomic',
      keywords: ['lift', 'strain', 'back', 'ergonomic', 'repetitive', 'posture'],
    },
    {
      name: 'Struck By',
      keywords: ['struck', 'hit', 'impact', 'falling object', 'collision'],
    },
    {
      name: 'Caught In/Between',
      keywords: ['caught', 'pinch', 'crush', 'trapped', 'between'],
    },
    {
      name: 'Cut/Laceration',
      keywords: ['cut', 'laceration', 'sharp', 'knife', 'blade'],
    },
    {
      name: 'Chemical',
      keywords: ['chemical', 'spill', 'exposure', 'burn', 'corrosive'],
    },
    {
      name: 'Electrical',
      keywords: ['electrical', 'shock', 'electric', 'power', 'voltage'],
    },
  ];

  let bestMatch = { category: 'Other', count: 0, keywords: [] as string[] };

  categories.forEach(category => {
    const matchedKeywords = category.keywords.filter(keyword => text.includes(keyword));
    if (matchedKeywords.length > bestMatch.count) {
      bestMatch = {
        category: category.name,
        count: matchedKeywords.length,
        keywords: matchedKeywords,
      };
    }
  });

  const confidence = Math.min(95, bestMatch.count * 30 + 10);

  return {
    suggestedCategory: bestMatch.category,
    confidence,
    keywords: bestMatch.keywords,
  };
}

/**
 * Context-aware filter suggestions
 */
export function getFilterSuggestions<T extends Record<string, unknown>>(
  data: T[],
  currentFilters: Partial<Record<keyof T, unknown[]>>
): Array<{ field: keyof T; value: string; impact: number }> {
  const suggestions: Array<{ field: keyof T; value: string; impact: number }> = [];

  // Analyze which filters would have the most impact
  const filterableFields = Object.keys(data[0] || {}) as (keyof T)[];

  filterableFields.forEach(field => {
    const values = new Set(data.map(item => String(item[field])));

    values.forEach(value => {
      // Calculate how many items this filter would affect
      const impact = data.filter(item => String(item[field]) === value).length;

      // Only suggest if impact is significant and not already filtered
      if (impact >= data.length * 0.1 && impact < data.length * 0.9) {
        const currentFieldFilters = currentFilters[field] as unknown[] || [];
        if (!currentFieldFilters.includes(value)) {
          suggestions.push({ field, value, impact });
        }
      }
    });
  });

  return suggestions
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);
}
