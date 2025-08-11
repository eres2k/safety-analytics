import React from 'react';
import FileUpload from '../Common/FileUpload';
import { useSafety } from '../../contexts/SafetyContext';
import toast from 'react-hot-toast';

export default function NearMissDashboard() {
  const { state, dispatch } = useSafety();

  const handleDataLoad = (data: any[]) => {
    dispatch({ type: 'SET_NEAR_MISS_DATA', payload: data });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Near Miss Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => toast.success('PDF report would be generated')}
              className="px-4 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
            >
              📄 Generate Report
            </button>
          </div>
        </div>

        {state.nearMiss.rawData.length === 0 && (
          <FileUpload onDataLoaded={handleDataLoad} type="nearmiss" />
        )}

        {state.nearMiss.rawData.length > 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Near miss data loaded: {state.nearMiss.rawData.length} records</p>
            <p className="mt-2">Full dashboard implementation coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
