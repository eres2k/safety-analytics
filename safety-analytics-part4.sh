#!/bin/bash

# Safety Analytics Platform - Part 4: Final Components
echo "🚀 Creating Final Components..."

# 10. Create Combined Analytics Component
cat > src/components/CombinedAnalytics/CombinedAnalytics.tsx << 'EOF'
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
EOF

# 11. Create Reports Component
cat > src/components/Reports/ReportGenerator.tsx << 'EOF'
import { useState } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import { DocumentIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { calculateKPIs } from '../../utils/dataProcessing';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ReportGenerator() {
  const { state } = useSafety();
  const [reportType, setReportType] = useState<'injury' | 'nearmiss' | 'combined'>('combined');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Safety Analytics Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPosition);
    yPosition += 10;

    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 20, yPosition);
    yPosition += 15;

    // KPIs
    const kpis = calculateKPIs(
      reportType === 'nearmiss' ? [] : state.injury.filteredData,
      reportType === 'injury' ? [] : state.nearMiss.filteredData
    );

    doc.setFontSize(14);
    doc.text('Key Performance Indicators', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const kpiData = [
      ['Metric', 'Value'],
      ['TRIR', kpis.TRIR.toFixed(2)],
      ['LTIR', kpis.LTIR.toFixed(2)],
      ['NMFR', kpis.NMFR.toFixed(2)],
      ['Total Incidents', kpis.totalIncidents.toString()],
      ['Near Misses', kpis.nearMissCount.toString()],
      ['Average Risk Score', kpis.avgRiskScore.toFixed(1)]
    ];

    autoTable(doc, {
      head: [kpiData[0]],
      body: kpiData.slice(1),
      startY: yPosition,
      margin: { left: 20 },
      theme: 'grid'
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Data Tables
    if (reportType !== 'nearmiss' && state.injury.filteredData.length > 0) {
      doc.setFontSize(14);
      doc.text('Injury Records Summary', 20, yPosition);
      yPosition += 10;

      const injuryData = state.injury.filteredData.slice(0, 10).map(record => [
        record.case_number,
        record.incident_date,
        record.site,
        record.severity,
        record.recordable === 1 ? 'Yes' : 'No'
      ]);

      autoTable(doc, {
        head: [['Case #', 'Date', 'Site', 'Severity', 'Recordable']],
        body: injuryData,
        startY: yPosition,
        margin: { left: 20 },
        theme: 'striped',
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    if (reportType !== 'injury' && state.nearMiss.filteredData.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Near Miss Records Summary', 20, yPosition);
      yPosition += 10;

      const nearMissData = state.nearMiss.filteredData.slice(0, 10).map(record => [
        record.incident_id,
        record.nearmiss_date,
        record.site,
        record.severity,
        record.risk.toFixed(1)
      ]);

      autoTable(doc, {
        head: [['ID', 'Date', 'Site', 'Severity', 'Risk Score']],
        body: nearMissData,
        startY: yPosition,
        margin: { left: 20 },
        theme: 'striped',
        styles: { fontSize: 8 }
      });
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} | Safety Analytics Platform | Amazon WHS Austria`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`safety_report_${reportType}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('PDF report generated successfully');
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();

    // KPIs Sheet
    const kpis = calculateKPIs(
      reportType === 'nearmiss' ? [] : state.injury.filteredData,
      reportType === 'injury' ? [] : state.nearMiss.filteredData
    );

    const kpiData = [
      ['Key Performance Indicators'],
      [''],
      ['Metric', 'Value'],
      ['TRIR', kpis.TRIR.toFixed(2)],
      ['LTIR', kpis.LTIR.toFixed(2)],
      ['NMFR', kpis.NMFR.toFixed(2)],
      ['Total Incidents', kpis.totalIncidents],
      ['Near Misses', kpis.nearMissCount],
      ['Average Risk Score', kpis.avgRiskScore.toFixed(1)],
      ['Critical Events', kpis.criticalEvents]
    ];

    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');

    // Injury Data Sheet
    if (reportType !== 'nearmiss' && state.injury.filteredData.length > 0) {
      const injurySheet = XLSX.utils.json_to_sheet(state.injury.filteredData);
      XLSX.utils.book_append_sheet(wb, injurySheet, 'Injury Data');
    }

    // Near Miss Data Sheet
    if (reportType !== 'injury' && state.nearMiss.filteredData.length > 0) {
      const nearMissSheet = XLSX.utils.json_to_sheet(state.nearMiss.filteredData);
      XLSX.utils.book_append_sheet(wb, nearMissSheet, 'Near Miss Data');
    }

    XLSX.writeFile(wb, `safety_report_${reportType}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success('Excel report generated successfully');
  };

  const hasData = state.injury.rawData.length > 0 || state.nearMiss.rawData.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Report Generator</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please upload data to generate reports
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Report Generator</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <div className="grid grid-cols-3 gap-4">
            {['combined', 'injury', 'nearmiss'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type as any)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === type
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {type === 'combined' ? '📊' : type === 'injury' ? '🏥' : '⚠️'}
                </div>
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Date Range (Optional)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Report Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Report Preview</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• Report Type: <span className="font-medium capitalize">{reportType}</span></p>
            <p>• Injury Records: <span className="font-medium">{state.injury.filteredData.length}</span></p>
            <p>• Near Miss Records: <span className="font-medium">{state.nearMiss.filteredData.length}</span></p>
            <p>• Date Generated: <span className="font-medium">{format(new Date(), 'PPP')}</span></p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4">
          <button
            onClick={generatePDF}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <DocumentIcon className="w-5 h-5" />
            Generate PDF Report
          </button>
          <button
            onClick={generateExcel}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            Generate Excel Report
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setReportType('combined');
              generatePDF();
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium">Executive Summary</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              High-level overview with KPIs and trends
            </div>
          </button>
          <button
            onClick={() => {
              setReportType('injury');
              generateExcel();
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium">Injury Detail Report</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete injury data with analysis
            </div>
          </button>
          <button
            onClick={() => {
              setReportType('nearmiss');
              generateExcel();
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium">Risk Assessment Report</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Near miss analysis with risk matrix
            </div>
          </button>
          <button
            onClick={() => {
              setReportType('combined');
              generateExcel();
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium">Full Data Export</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All data in Excel format for analysis
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

# 12. Create Action Tracking Component
cat > src/components/Actions/ActionTracking.tsx << 'EOF'
import { useState } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import { PlusIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ActionTracking() {
  const { state, dispatch } = useSafety();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    incidentId: '',
    type: 'injury' as 'injury' | 'nearmiss',
    action: '',
    responsible: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const handleAddAction = () => {
    const action = {
      ...newAction,
      id: Date.now().toString(),
      status: 'open' as const,
      createdDate: format(new Date(), 'yyyy-MM-dd')
    };
    
    dispatch({ type: 'ADD_ACTION', payload: action });
    toast.success('Action added successfully');
    setShowAddForm(false);
    setNewAction({
      incidentId: '',
      type: 'injury',
      action: '',
      responsible: '',
      dueDate: '',
      priority: 'medium'
    });
  };

  const updateActionStatus = (id: string, status: 'open' | 'in-progress' | 'completed') => {
    const action = state.actions.find(a => a.id === id);
    if (action) {
      dispatch({
        type: 'UPDATE_ACTION',
        payload: {
          ...action,
          status,
          completedDate: status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined
        }
      });
      toast.success(`Action ${status === 'completed' ? 'completed' : 'updated'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const actionStats = {
    total: state.actions.length,
    open: state.actions.filter(a => a.status === 'open').length,
    inProgress: state.actions.filter(a => a.status === 'in-progress').length,
    completed: state.actions.filter(a => a.status === 'completed').length,
    overdue: state.actions.filter(a => 
      a.status !== 'completed' && new Date(a.dueDate) < new Date()
    ).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Action Tracking</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Action
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Actions</p>
          <p className="text-2xl font-bold">{actionStats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          <p className="text-2xl font-bold text-gray-600">{actionStats.open}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{actionStats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600">{actionStats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{actionStats.overdue}</p>
        </div>
      </div>

      {/* Add Action Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Action</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Incident ID</label>
                <input
                  type="text"
                  value={newAction.incidentId}
                  onChange={(e) => setNewAction({ ...newAction, incidentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newAction.type}
                  onChange={(e) => setNewAction({ ...newAction, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="injury">Injury</option>
                  <option value="nearmiss">Near Miss</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action Description</label>
                <textarea
                  value={newAction.action}
                  onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsible Person</label>
                <input
                  type="text"
                  value={newAction.responsible}
                  onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newAction.priority}
                  onChange={(e) => setNewAction({ ...newAction, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAction}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Action
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Active Actions</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {state.actions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No actions tracked yet. Click "Add Action" to get started.
            </div>
          ) : (
            state.actions.map(action => (
              <div key={action.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(action.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{action.incidentId}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          action.type === 'injury' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {action.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {action.action}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Responsible: {action.responsible}</span>
                        <span>Due: {action.dueDate}</span>
                        {action.completedDate && (
                          <span>Completed: {action.completedDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {action.status !== 'completed' && (
                      <>
                        {action.status === 'open' && (
                          <button
                            onClick={() => updateActionStatus(action.id, 'in-progress')}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => updateActionStatus(action.id, 'completed')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
EOF

echo "Final components created! Run install_final.sh to complete setup..."