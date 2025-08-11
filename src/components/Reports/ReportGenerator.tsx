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
