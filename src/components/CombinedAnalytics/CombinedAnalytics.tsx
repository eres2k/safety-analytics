import { useSafety } from '../../contexts/SafetyContext';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { calculateKPIs, generateColors } from '../../utils/dataProcessing';
import KPICard from '../Common/KPICard';

export default function CombinedAnalytics() {
  const { state } = useSafety();
  
  const hasData = state.injury.rawData.length > 0 || state.nearMiss.rawData.length > 0;
  
  if (!hasData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Combined Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please upload injury and near miss data to view combined analytics
        </p>
      </div>
    );
  }

  const kpis = calculateKPIs(state.injury.filteredData, state.nearMiss.filteredData);

  // Combined trend analysis
  const monthlyData: Record<string, { injuries: number; nearMisses: number }> = {};
  
  state.injury.filteredData.forEach(record => {
    if (record.parsedDate) {
      const monthKey = `${record.parsedDate.getFullYear()}-${String(record.parsedDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { injuries: 0, nearMisses: 0 };
      monthlyData[monthKey].injuries++;
    }
  });
  
  state.nearMiss.filteredData.forEach(record => {
    if (record.parsedDate) {
      const monthKey = `${record.parsedDate.getFullYear()}-${String(record.parsedDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { injuries: 0, nearMisses: 0 };
      monthlyData[monthKey].nearMisses++;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const combinedTrendData = {
    labels: sortedMonths.map(month => {
      const [year, m] = month.split('-');
      return `${m}/${year.slice(2)}`;
    }),
    datasets: [
      {
        label: 'Injuries',
        data: sortedMonths.map(month => monthlyData[month]?.injuries || 0),
        borderColor: '#FF9900',
        backgroundColor: 'rgba(255, 153, 0, 0.1)',
        tension: 0.4
      },
      {
        label: 'Near Misses',
        data: sortedMonths.map(month => monthlyData[month]?.nearMisses || 0),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Site comparison
  const siteCombined: Record<string, { injuries: number; nearMisses: number; total: number }> = {};
  
  state.injury.filteredData.forEach(record => {
    if (!siteCombined[record.site]) siteCombined[record.site] = { injuries: 0, nearMisses: 0, total: 0 };
    siteCombined[record.site].injuries++;
    siteCombined[record.site].total++;
  });
  
  state.nearMiss.filteredData.forEach(record => {
    if (!siteCombined[record.site]) siteCombined[record.site] = { injuries: 0, nearMisses: 0, total: 0 };
    siteCombined[record.site].nearMisses++;
    siteCombined[record.site].total++;
  });

  const siteComparisonData = {
    labels: Object.keys(siteCombined),
    datasets: [
      {
        label: 'Injuries',
        data: Object.values(siteCombined).map(d => d.injuries),
        backgroundColor: '#FF9900'
      },
      {
        label: 'Near Misses',
        data: Object.values(siteCombined).map(d => d.nearMisses),
        backgroundColor: '#4CAF50'
      }
    ]
  };

  // Severity correlation
  const severityCorrelation = {
    datasets: [
      {
        label: 'Injuries',
        data: state.injury.filteredData.map(record => ({
          x: ['D', 'C', 'B', 'A'].indexOf(record.severity) + 1,
          y: record.total_dafw_days || 0
        })),
        backgroundColor: 'rgba(255, 153, 0, 0.6)'
      },
      {
        label: 'Near Misses',
        data: state.nearMiss.filteredData.map(record => ({
          x: ['D', 'C', 'B', 'A'].indexOf(record.severity) + 1,
          y: record.risk || 0
        })),
        backgroundColor: 'rgba(76, 175, 80, 0.6)'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Combined Analytics</h2>

      {/* Combined KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Events"
          value={kpis.totalIncidents + kpis.nearMissCount}
          icon="📊"
          color="orange"
        />
        <KPICard
          title="TRIR"
          value={kpis.TRIR.toFixed(2)}
          icon="📈"
          color="red"
        />
        <KPICard
          title="NMFR"
          value={kpis.NMFR.toFixed(2)}
          icon="⚠️"
          color="blue"
        />
        <KPICard
          title="Critical Events"
          value={kpis.criticalEvents}
          icon="🔴"
          color="red"
        />
        <KPICard
          title="Avg Risk"
          value={kpis.avgRiskScore.toFixed(1)}
          icon="🎯"
          color={kpis.avgRiskScore > 5 ? 'red' : 'green'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Combined Incident Trends</h3>
          <div className="h-64">
            <Line data={combinedTrendData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </div>

        {/* Site Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Site Comparison</h3>
          <div className="h-64">
            <Bar data={siteComparisonData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                x: {
                  stacked: true
                },
                y: {
                  stacked: true,
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </div>

        {/* Severity Correlation */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Severity Impact Analysis</h3>
          <div className="h-64">
            <Scatter data={severityCorrelation} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const severity = ['', 'D', 'C', 'B', 'A'][context.parsed.x] || '';
                      return `${context.dataset.label}: Severity ${severity}, Value: ${context.parsed.y}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Severity (1=D, 2=C, 3=B, 4=A)'
                  },
                  min: 0,
                  max: 5
                },
                y: {
                  title: {
                    display: true,
                    text: 'Impact (Days/Risk Score)'
                  },
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{state.injury.filteredData.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Injuries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{state.nearMiss.filteredData.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Near Misses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {state.injury.filteredData.filter(d => d.recordable === 1).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recordable</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {state.nearMiss.filteredData.filter(d => d.risk > 6).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Risk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
