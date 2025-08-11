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
