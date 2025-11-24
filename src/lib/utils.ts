/**
 * Core Utility Functions
 * Migrated from legacy system with enhancements
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays, subDays, isWithinInterval } from 'date-fns';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date consistently
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // Try ISO format first
    if (dateStr.includes('T') || dateStr.includes('-')) {
      return parseISO(dateStr);
    }

    // Try MM/DD/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(dateStr);
  } catch {
    return null;
  }
}

/**
 * Calculate days between dates
 */
export function daysBetween(start: string | Date, end: string | Date): number {
  try {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    return differenceInDays(endDate, startDate);
  } catch {
    return 0;
  }
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: string | Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return true;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isWithinInterval(dateObj, { start, end });
  } catch {
    return false;
  }
}

/**
 * Get date range for trend analysis
 */
export function getTrendDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = subDays(end, days);
  return { start, end };
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate severity score
 */
export function calculateSeverityScore(severity: string): number {
  const scores: Record<string, number> = {
    'Minor': 1,
    'Moderate': 2,
    'Serious': 3,
    'Severe': 4,
    'Critical': 5,
    'Fatal': 5,
  };
  return scores[severity] || 0;
}

/**
 * Calculate likelihood score
 */
export function calculateLikelihoodScore(likelihood: string): number {
  const scores: Record<string, number> = {
    'Rare': 1,
    'Unlikely': 2,
    'Possible': 3,
    'Likely': 4,
    'Almost Certain': 5,
  };
  return scores[likelihood] || 3;
}

/**
 * Calculate risk score (severity × likelihood)
 */
export function calculateRiskScore(severity: string, likelihood?: string): number {
  const severityScore = calculateSeverityScore(severity);
  const likelihoodScore = likelihood ? calculateLikelihoodScore(likelihood) : 3;
  return severityScore * likelihoodScore;
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score <= 4) return 'Low';
  if (score <= 9) return 'Medium';
  if (score <= 16) return 'High';
  return 'Critical';
}

/**
 * Get color for severity
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    'Minor': 'text-success',
    'Moderate': 'text-warning',
    'Serious': 'text-orange-500',
    'Severe': 'text-danger',
    'Critical': 'text-critical',
    'Fatal': 'text-critical',
  };
  return colors[severity] || 'text-muted-foreground';
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    'Low': 'bg-success',
    'Medium': 'bg-warning',
    'High': 'bg-danger',
    'Critical': 'bg-critical',
  };
  return colors[level] || 'bg-muted';
}

/**
 * Generate consistent color palette
 */
export function generateColorPalette(count: number): string[] {
  const baseColors = [
    '#FF9900', // Amazon Orange
    '#146EB4', // Amazon Blue
    '#2ECC71', // Green
    '#E74C3C', // Red
    '#9B59B6', // Purple
    '#F39C12', // Orange
    '#1ABC9C', // Teal
    '#E67E22', // Dark Orange
    '#3498DB', // Light Blue
    '#95A5A6', // Gray
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors
  const colors = [...baseColors];
  while (colors.length < count) {
    const hue = (colors.length * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate average
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Calculate median
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const avg = average(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const avgSquareDiff = average(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Safe JSON parse
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Download file
 */
export function downloadFile(data: Blob | string, filename: string, mimeType: string = 'text/plain') {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
