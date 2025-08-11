import { useState, useEffect } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import FileUpload from '../Common/FileUpload';
import FilterPanel from '../Common/FilterPanel';
import KPICard from '../Common/KPICard';
import { parseInjuryCSV } from '../../utils/csvParser';
import { calculateKPIs } from '../../utils/dataProcessing';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { defaultChartOptions, pieChartOptions, lineChartOptions } from '../../utils/chartConfig';
import { generateColors } from '../../utils/dataProcessing';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { exportToCSV } from '../../utils/csvParser';

export default function InjuryDashboard() {
  const { state, dispatch } = useSafety();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFileUpload = async (file: File) => {
    try {
      const data = await parseInjuryCSV(file);
      dispatch({ type: 'SET_INJURY_DATA', payload: data });
      toast.success(`Loaded ${data.length} injury records`);
    } catch (error) {
      toast.error('Error parsing CSV file');
      console.error(error);
    }
  };

  const exportData = () => {
    exportToCSV(state.injury.filteredData, 'injury_data_export.csv');
    toast.success('Data exported successfully');
  };

  if (state.injury.rawData.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Injury & Illness Module</h2>
        <FileUpload 
          onFileSelect={handleFileUpload}
          label="Upload Injury & Illness Data"
          type="injury"
        />
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Expected CSV Format:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• case_number, incident_date, site, severity</li>
            <li>• recordable (0/1), total_dafw_days, otr (yes/no)</li>
            <li>• initial_info_principal_body_part, rca_primary_cause</li>
            <li>• processPath (optional)</li>
          </ul>
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs(state.injury.filteredData, []);
  
  // Prepare chart data
  const bodyPartCounts: Record<string, number> = {};
  const rootCauseCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};

  state.injury.filteredData.forEach(record => {
    // Body parts
    if (record.bodyPart) {
      bodyPartCounts[record.bodyPart] = (bodyPartCounts[record.bodyPart] || 0) + 1;
    }
    
    // Root causes
    if (record.rootCause) {
      rootCauseCounts[record.rootCause] = (rootCauseCounts[record.rootCause] || 0) + 1;
    }
    
    // Monthly trend
    if (record.parsedDate) {
      const monthKey = `${record.parsedDate.getFullYear()}-${String(record.parsedDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    }
  });

  // Top 10 body parts
  const topBodyParts = Object.entries(bodyPartCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const bodyPartData = {
    labels: topBodyParts.map(([part]) => part),
    datasets: [{
      data: topBodyParts.map(([,count]) => count),
      backgroundColor: generateColors(topBodyParts.length)
    }]
  };

  // Top 10 root causes
  const topRootCauses = Object.entries(rootCauseCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const rootCauseData = {
    labels: topRootCauses.map(([cause]) => cause.substring(0, 30) + (cause.length > 30 ? '...' : '')),
    datasets: [{
      label: 'Incidents',
      data: topRootCauses.map(([,count]) => count),
      backgroundColor: '#FF9900'
    }]
  };

  // Monthly trend
  const sortedMonths = Object.keys(monthlyCounts).sort();
  const trendData = {
    labels: sortedMonths.map(month => {
      const [year, m] = month.split('-');
      return `${m}/${year.slice(2)}`;
    }),
    datasets: [{
      label: 'Injuries',
      data: sortedMonths.map(month => monthlyCounts[month]),
      borderColor: '#FF9900',
      backgroundColor: 'rgba(255, 153, 0, 0.1)',
      tension: 0.4
    }]
  };

  // Pagination
  const totalPages = Math.ceil(state.injury.filteredData.length / itemsPerPage);
  const paginatedData = state.injury.filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Injury & Illness Analysis</h2>
        <div className="flex gap-2">
          <FilterPanel type="injury" />
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Injuries"
          value={kpis.totalIncidents}
          icon="🏥"
          color="orange"
        />
        <KPICard
          title="Recordable"
          value={kpis.recordableIncidents}
          icon="📝"
          color="red"
        />
        <KPICard
          title="Lost Time"
          value={kpis.lostTimeIncidents}
          icon="⏰"
          color="blue"
        />
        <KPICard
          title="TRIR"
          value={kpis.TRIR.toFixed(2)}
          icon="📊"
          color="gray"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Parts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Affected Body Parts</h3>
          <div className="h-64">
            <Pie data={bodyPartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Root Causes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Root Causes</h3>
          <div className="h-64">
            <Bar data={rootCauseData} options={{
              ...defaultChartOptions,
              indexAxis: 'y' as const
            }} />
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          <div className="h-64">
            <Line data={trendData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Injury Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Case #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Body Part
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Recordable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  DAFW Days
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm">{record.case_number}</td>
                  <td className="px-4 py-3 text-sm">{record.incident_date}</td>
                  <td className="px-4 py-3 text-sm">{record.site}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.severity === 'A' ? 'bg-red-100 text-red-800' :
                      record.severity === 'B' ? 'bg-orange-100 text-orange-800' :
                      record.severity === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{record.bodyPart}</td>
                  <td className="px-4 py-3 text-sm">
                    {record.recordable === 1 ? (
                      <span className="text-red-600">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{record.total_dafw_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, state.injury.filteredData.length)} of {state.injury.filteredData.length} records
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
