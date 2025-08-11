import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: 'orange' | 'green' | 'red' | 'blue' | 'gray';
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'orange'
}: KPICardProps) {
  const colorClasses = {
    orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
    green: 'bg-gradient-to-br from-green-400 to-green-600',
    red: 'bg-gradient-to-br from-red-400 to-red-600',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
    gray: 'bg-gradient-to-br from-gray-400 to-gray-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className={`h-2 ${colorClasses[color]}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <span className="text-3xl opacity-50">{icon}</span>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {trend === 'up' && <ArrowUpIcon className="w-4 h-4" />}
              {trend === 'down' && <ArrowDownIcon className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
