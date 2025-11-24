/**
 * Badge Component
 * Status and label badges
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'critical' | 'info';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'badge-default',
      secondary: 'badge-secondary',
      destructive: 'badge-destructive',
      outline: 'badge-outline',
      success: 'badge-success',
      warning: 'badge-warning',
      critical: 'badge-critical',
      info: 'badge-info',
    };

    return (
      <div
        ref={ref}
        className={cn('badge', variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Get badge variant based on severity
 */
export function getSeverityBadgeVariant(severity: string): BadgeProps['variant'] {
  const severityMap: Record<string, BadgeProps['variant']> = {
    'Minor': 'success',
    'Moderate': 'warning',
    'Serious': 'destructive',
    'Severe': 'critical',
    'Critical': 'critical',
    'Fatal': 'critical',
  };

  return severityMap[severity] || 'default';
}

/**
 * Get badge variant based on status
 */
export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  const statusMap: Record<string, BadgeProps['variant']> = {
    'Open': 'warning',
    'In Progress': 'info',
    'Completed': 'success',
    'Closed': 'secondary',
    'Overdue': 'critical',
    'Upcoming': 'info',
  };

  return statusMap[status] || 'default';
}
