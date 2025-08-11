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
