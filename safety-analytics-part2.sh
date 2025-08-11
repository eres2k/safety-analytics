#!/bin/bash

# Safety Analytics Platform - Part 2: Components
echo "🚀 Creating Component Files..."

# 6. Create Common Components

# File Upload Component
cat > src/components/Common/FileUpload.tsx << 'EOF'
import { useState, useRef } from 'react';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  type?: 'injury' | 'nearmiss';
}

export default function FileUpload({ 
  onFileSelect, 
  accept = '.csv', 
  label = 'Upload CSV File',
  type 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
        onFileSelect(files[0]);
        toast.success(`File ${files[0].name} uploaded successfully`);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
      toast.success(`File ${files[0].name} uploaded successfully`);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging 
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        {type === 'injury' ? (
          <div className="text-6xl">🏥</div>
        ) : type === 'nearmiss' ? (
          <div className="text-6xl">⚠️</div>
        ) : (
          <DocumentIcon className="w-16 h-16 text-gray-400" />
        )}
        
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop or click to browse
          </p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Choose File
        </button>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Supported format: CSV
        </p>
      </div>
    </div>
  );
}
EOF

# Filter Panel Component
cat > src/components/Common/FilterPanel.tsx << 'EOF'
import { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSafety } from '../../contexts/SafetyContext';
import { filterData } from '../../utils/dataProcessing';

interface FilterPanelProps {
  type: 'injury' | 'nearmiss';
}

export default function FilterPanel({ type }: FilterPanelProps) {
  const { state, dispatch } = useSafety();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(state.filters);

  const data = type === 'injury' ? state.injury.rawData : state.nearMiss.rawData;
  
  // Extract unique values for filters
  const sites = [...new Set(data.map(d => d.site))].filter(Boolean);
  const severities = ['A', 'B', 'C', 'D', 'Unknown'];
  
  const applyFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: localFilters });
    
    const filtered = filterData(data, localFilters);
    
    if (type === 'injury') {
      dispatch({ type: 'SET_FILTERED_INJURY', payload: filtered as any });
    } else {
      dispatch({ type: 'SET_FILTERED_NEARMISS', payload: filtered as any });
    }
    
    setIsOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    dispatch({ type: 'SET_FILTERS', payload: {} });
    
    if (type === 'injury') {
      dispatch({ type: 'SET_FILTERED_INJURY', payload: state.injury.rawData });
    } else {
      dispatch({ type: 'SET_FILTERED_NEARMISS', payload: state.nearMiss.rawData });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <FunnelIcon className="w-5 h-5" />
        Filters
        {Object.keys(state.filters).length > 0 && (
          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
            {Object.keys(state.filters).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white dark:bg-gray-800 w-96 h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Site Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Site</label>
                <select
                  value={localFilters.site || 'all'}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    site: e.target.value === 'all' ? undefined : e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Sites</option>
                  {sites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  value={localFilters.severity || 'all'}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    severity: e.target.value === 'all' ? undefined : e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Severities</option>
                  {severities.map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateFrom: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateTo: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
EOF

# KPI Card Component
cat > src/components/Common/KPICard.tsx << 'EOF'
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
EOF

# 7. Create Dashboard Overview Component
cat > src/components/Dashboard/Overview.tsx << 'EOF'
import { useSafety } from '../../contexts/SafetyContext';
import { calculateKPIs } from '../../utils/dataProcessing';
import KPICard from '../Common/KPICard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { lineChartOptions, pieChartOptions, defaultChartOptions } from '../../utils/chartConfig';
import { aggregateByMonth, generateColors } from '../../utils/dataProcessing';

export default function Overview() {
  const { state } = useSafety();
  const hasInjuryData = state.injury.rawData.length > 0;
  const hasNearMissData = state.nearMiss.rawData.length > 0;
  const hasData = hasInjuryData || hasNearMissData;

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-gray-800 bg-clip-text text-transparent">
          Welcome to Safety Analytics Platform
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your comprehensive platform for workplace safety data analysis
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track safety metrics and KPIs in real-time
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify patterns and prevent future incidents
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">Automated Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate comprehensive safety reports instantly
            </p>
          </div>
        </div>
        <div className="mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by uploading your safety data
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/injury'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              <span className="mr-2">🏥</span> Upload Injury Data
            </button>
            <button
              onClick={() => window.location.href = '/nearmiss'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              <span className="mr-2">⚠️</span> Upload Near Miss Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs(state.injury.filteredData, state.nearMiss.filteredData);
  
  // Prepare trend data
  const injuryTrend = aggregateByMonth(state.injury.filteredData);
  const nearMissTrend = aggregateByMonth(state.nearMiss.filteredData);
  
  const trendData = {
    labels: [...new Set([...injuryTrend.map(d => d.month), ...nearMissTrend.map(d => d.month)])].sort(),
    datasets: [
      {
        label: 'Injuries',
        data: injuryTrend.map(d => d.count),
        borderColor: '#FF9900',
        backgroundColor: 'rgba(255, 153, 0, 0.1)',
        tension: 0.4
      },
      {
        label: 'Near Misses',
        data: nearMissTrend.map(d => d.count),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Severity distribution
  const severityCounts: Record<string, number> = {};
  [...state.injury.filteredData, ...state.nearMiss.filteredData].forEach(record => {
    severityCounts[record.severity] = (severityCounts[record.severity] || 0) + 1;
  });

  const severityData = {
    labels: Object.keys(severityCounts),
    datasets: [{
      data: Object.values(severityCounts),
      backgroundColor: generateColors(Object.keys(severityCounts).length)
    }]
  };

  // Site comparison
  const siteCounts: Record<string, { injuries: number; nearMisses: number }> = {};
  state.injury.filteredData.forEach(record => {
    if (!siteCounts[record.site]) siteCounts[record.site] = { injuries: 0, nearMisses: 0 };
    siteCounts[record.site].injuries++;
  });
  state.nearMiss.filteredData.forEach(record => {
    if (!siteCounts[record.site]) siteCounts[record.site] = { injuries: 0, nearMisses: 0 };
    siteCounts[record.site].nearMisses++;
  });

  const siteData = {
    labels: Object.keys(siteCounts),
    datasets: [
      {
        label: 'Injuries',
        data: Object.values(siteCounts).map(d => d.injuries),
        backgroundColor: '#FF9900'
      },
      {
        label: 'Near Misses',
        data: Object.values(siteCounts).map(d => d.nearMisses),
        backgroundColor: '#4CAF50'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="TRIR"
          subtitle="Total Recordable Incident Rate"
          value={kpis.TRIR.toFixed(2)}
          icon="📊"
          color="orange"
          trend={kpis.TRIR > 2 ? 'up' : 'down'}
          trendValue={`${kpis.TRIR > 2 ? '+' : ''}${(kpis.TRIR - 2).toFixed(1)}`}
        />
        <KPICard
          title="LTIR"
          subtitle="Lost Time Incident Rate"
          value={kpis.LTIR.toFixed(2)}
          icon="⏰"
          color="red"
          trend={kpis.LTIR > 1 ? 'up' : 'down'}
          trendValue={`${kpis.LTIR > 1 ? '+' : ''}${(kpis.LTIR - 1).toFixed(1)}`}
        />
        <KPICard
          title="Near Miss Rate"
          subtitle="Per 200,000 hours"
          value={kpis.NMFR.toFixed(2)}
          icon="⚠️"
          color="blue"
        />
        <KPICard
          title="Avg Risk Score"
          subtitle="Scale 0-10"
          value={kpis.avgRiskScore.toFixed(1)}
          icon="🎯"
          color={kpis.avgRiskScore > 5 ? 'red' : 'green'}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p>
          <p className="text-2xl font-bold">{kpis.totalIncidents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recordable</p>
          <p className="text-2xl font-bold">{kpis.recordableIncidents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Near Misses</p>
          <p className="text-2xl font-bold">{kpis.nearMissCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critical Events</p>
          <p className="text-2xl font-bold text-red-500">{kpis.criticalEvents}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Incident Trends</h3>
          <div className="h-64">
            <Line data={trendData} options={lineChartOptions} />
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
          <div className="h-64">
            <Doughnut data={severityData} options={pieChartOptions} />
          </div>
        </div>

        {/* Site Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Site Comparison</h3>
          <div className="h-64">
            <Bar data={siteData} options={defaultChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo "Components created successfully! Run install_part3.sh to continue..."