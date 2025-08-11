import React, { useMemo } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import toast from 'react-hot-toast';

export default function Overview() {
  const { state } = useSafety();
  const hasData = state.injury.rawData.length > 0 || state.nearMiss.rawData.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amazon-orange to-amazon-dark bg-clip-text text-transparent">
          Welcome to Safety Analytics
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your comprehensive platform for workplace safety data analysis
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.href = '/injury'}
            className="px-6 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
          >
            <span className="mr-2">🏥</span> Analyze Injuries
          </button>
          <button
            onClick={() => window.location.href = '/nearmiss'}
            className="px-6 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
          >
            <span className="mr-2">⚠️</span> Review Near Misses
          </button>
          <button
            onClick={() => toast.success('Sample data would be loaded here')}
            className="px-6 py-3 bg-amazon-dark text-white rounded-lg hover:bg-amazon-gray transition-colors"
          >
            <span className="mr-2">🧪</span> Load Sample Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">TRIR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">LTIR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">DAFWR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">NMFR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
