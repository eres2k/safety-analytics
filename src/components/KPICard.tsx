/**
 * KPI Card Component
 * Displays key performance indicator with trend
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface KPICardProps {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  format?: 'number' | 'decimal' | 'percent';
  className?: string;
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  trend,
  trendLabel,
  icon,
  format = 'decimal',
  className,
  delay = 0,
}) => {
  const formattedValue = typeof value === 'number' ? formatValue(value, format) : value;

  const trendDirection = trend ? (trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral') : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn('kpi-card', className)} hover>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="kpi-label">{label}</p>
              <p className="kpi-value">{formattedValue}</p>

              {trend !== undefined && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'kpi-trend',
                      trendDirection === 'up' && 'kpi-trend-down', // For safety metrics, up is bad
                      trendDirection === 'down' && 'kpi-trend-up', // Down is good
                      trendDirection === 'neutral' && 'kpi-trend-neutral'
                    )}
                  >
                    {trendDirection === 'up' && <TrendingUp className="h-4 w-4" />}
                    {trendDirection === 'down' && <TrendingDown className="h-4 w-4" />}
                    {trendDirection === 'neutral' && <Minus className="h-4 w-4" />}
                    <span>{Math.abs(trend).toFixed(1)}%</span>
                  </div>
                  {trendLabel && (
                    <span className="text-xs text-muted-foreground">{trendLabel}</span>
                  )}
                </div>
              )}
            </div>

            {icon && (
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function formatValue(value: number, format: 'number' | 'decimal' | 'percent'): string {
  switch (format) {
    case 'number':
      return formatNumber(value, 0);
    case 'decimal':
      return value.toFixed(2);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return value.toString();
  }
}
