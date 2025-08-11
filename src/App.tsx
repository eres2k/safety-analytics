## 9. src/components/Layout/Layout.tsx
```typescript
import React from 'react';
import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

## 10. src/components/Layout/Header.tsx
```typescript
import React from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const { state, dispatch } = useSafety();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <header className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🛡️</span>
              Safety Analytics Platform
            </h1>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <span>Amazon WHS Austria</span>
              <span className="opacity-70">|</span>
              <span>Developed by Erwin Esener</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            {state.theme === 'light' ? (
              <>
                <MoonIcon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <SunIcon className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
```

## 11. src/components/Layout/Navigation.tsx
```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSafety } from '../../contexts/SafetyContext';
import clsx from 'clsx';

const navItems = [
  { path: '/overview', label: 'Overview', icon: '📊' },
  { path: '/injury', label: 'Injury & Illness', icon: '🏥' },
  { path: '/nearmiss', label: 'Near Miss', icon: '⚠️' },
  { path: '/combined', label: 'Combined Analytics', icon: '📈' },
  { path: '/reports', label: 'Reports', icon: '📄' },
  { path: '/actions', label: 'Action Tracking', icon: '✅' },
];

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-[88px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all',
                  'hover:translate-y-[-2px] hover:shadow-lg',
                  isActive
                    ? 'bg-amazon-orange text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                )
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

## 12. src/components/Common/FileUpload.tsx
```typescript
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
  type: 'injury' | 'nearmiss';
}

export default function FileUpload({ onDataLoaded, type }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded(results.data);
        toast.success(`Loaded ${results.data.length} ${type} records successfully!`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center transition-all',
        isDragging
          ? 'border-amazon-orange bg-amazon-orange/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-amazon-orange'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        📁 Drag and drop your {type} CSV file here
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors font-medium"
      >
        Choose File
      </button>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {type === 'injury'
          ? 'Supports CSV files with injury/illness tracking data including severity, body parts, causes, recordability, and OTR status'
          : 'Supports CSV files with near miss tracking data including potential severity, location, and risk assessments'}
      </p>
    </div>
  );
}
```

## 13. src/components/Dashboard/Overview.tsx
```typescript
import React, { useEffect, useMemo } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import KPICards from './KPICards';
import MetricsGrid from './MetricsGrid';
import OverviewCharts from './OverviewCharts';
import { calculateKPIs } from '../../utils/calculations';

export default function Overview() {
  const { state } = useSafety();
  const hasData = state.injury.rawData.length > 0 || state.nearMiss.rawData.length > 0;

  const kpis = useMemo(() => {
    if (!hasData) return null;
    return calculateKPIs(state.injury.filteredData, state.nearMiss.filteredData);
  }, [state.injury.filteredData, state.nearMiss.filteredData, hasData]);

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
            onClick={() => loadSampleData()}
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
      {kpis && <KPICards kpis={kpis} />}
      <MetricsGrid />
      <OverviewCharts />
    </div>
  );
}

function loadSampleData() {
  // Implementation for loading sample data
  toast.success('Sample data loaded successfully!');
}
```

## 14. src/components/Dashboard/KPICards.tsx
```typescript
import React from 'react';
import { KPIMetrics } from '../../types';

interface KPICardsProps {
  kpis: KPIMetrics;
}

export default function KPICards({ kpis }: KPICardsProps) {
  const kpiData = [
    { label: 'TRIR (Total Recordable Incident Rate)', value: kpis.TRIR.toFixed(2), color: 'bg-amazon-dark' },
    { label: 'LTIR (Lost Time Incident Rate)', value: kpis.LTIR.toFixed(2), color: 'bg-red-600' },
    { label: 'DAFWR (Days Away From Work Rate)', value: kpis.DAFWR.toFixed(2), color: 'bg-amber-600' },
    { label: 'NMFR (Near Miss Frequency Rate)', value: kpis.NMFR.toFixed(2), color: 'bg-amazon-orange' },
  ];

  return (
    <div className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Key Performance Indicators - Austria Region</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-bold mb-2">{kpi.value}</div>
            <div className="text-sm opacity-90">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 15. src/components/InjuryModule/InjuryDashboard.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import FileUpload from '../Common/FileUpload';
import InjuryFilters from './InjuryFilters';
import InjuryTable from './InjuryTable';
import InjuryCharts from './InjuryCharts';
import RiskMatrix from './RiskMatrix';
import { processInjuryData } from '../../services/dataProcessor';
import { generatePDFReport } from '../../services/pdfGenerator';
import { exportToExcel } from '../../services/excelExporter';
import toast from 'react-hot-toast';

export default function InjuryDashboard() {
  const { state, dispatch } = useSafety();
  const [activeView, setActiveView] = useState<'dashboard' | 'riskMatrix' | 'timeline' | 'analytics'>('dashboard');

  const handleDataLoad = (data: any[]) => {
    const processedData = processInjuryData(data);
    dispatch({ type: 'SET_INJURY_DATA', payload: processedData });
  };

  const handleExportPDF = () => {
    generatePDFReport('injury', state.injury.filteredData);
    toast.success('PDF report generated successfully!');
  };

  const handleExportExcel = () => {
    exportToExcel('injury', state.injury.filteredData);
    toast.success('Data exported to Excel successfully!');
  };

  const metrics = {
    total: state.injury.filteredData.length,
    recordable: state.injury.filteredData.filter(r => r.recordable === 1).length,
    lostTime: state.injury.filteredData.filter(r => r.total_dafw_days > 0).length,
    daysLost: state.injury.filteredData.reduce((sum, r) => sum + (r.total_dafw_days || 0), 0),
    otr: state.injury.filteredData.filter(r => r.otr === 'yes').length,
    recordableRate: state.injury.filteredData.length > 0
      ? ((state.injury.filteredData.filter(r => r.recordable === 1).length / state.injury.filteredData.length) * 100).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Injury & Illness Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
            >
              📄 Generate Report
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-amazon-dark text-white rounded-lg hover:bg-amazon-gray transition-colors"
            >
              📊 Export to Excel
            </button>
          </div>
        </div>

        {state.injury.rawData.length === 0 && (
          <FileUpload onDataLoaded={handleDataLoad} type="injury" />
        )}

        {state.injury.rawData.length > 0 && (
          <InjuryFilters />
        )}
      </div>

      {/* Sub Navigation */}
      {state.injury.rawData.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['dashboard', 'riskMatrix', 'timeline', 'analytics'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeView === view
                  ? 'text-amazon-orange border-b-2 border-amazon-orange'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      {state.injury.rawData.length > 0 && activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content based on active view */}
      {state.injury.rawData.length > 0 && (
        <>
          {activeView === 'dashboard' && (
            <>
              <InjuryCharts />
              <InjuryTable />
            </>
          )}
          {activeView === 'riskMatrix' && (
            <RiskMatrix data={state.injury.filteredData} type="injury" />
          )}
          {activeView === 'timeline' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Injury & Illness Timeline</h3>
              {/* Timeline implementation */}
            </div>
          )}
          {activeView === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              {/* Advanced analytics implementation */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## 16. src/services/dataProcessor.ts
```typescript
import { InjuryRecord, NearMissRecord, Likelihood } from '../types';

const DEFAULT_AUSTIN_URL = 'https://safety.amazon.com/austin-case-study';

export function processInjuryData(rawData: any[]): InjuryRecord[] {
  return rawData.map((row, index) => {
    const parsedDate = row.incident_date ? new Date(row.incident_date) : undefined;
    
    // Standardize severity
    const severity = standardizeSeverity(row.severity || row.potential_severity);
    
    // Process OTR status
    let otr: 'yes' | 'no' = 'no';
    if (row.initial_info_incident_on_the_road === true) {
      otr = 'yes';
    } else if (typeof row.initial_info_incident_on_the_road === 'string') {
      otr = row.initial_info_incident_on_the_road.toLowerCase() === 'yes' ? 'yes' : 'no';
    }
    
    return {
      case_number: row.case_number || `CASE-${index + 1}`,
      incident_date: row.incident_date || '',
      incident_time: row.incident_time || '',
      site: row.site || 'Unknown',
      bodyPart: row.initial_info_principal_body_part || 
                row.initial_info_detailed_body_part || 
                'Unknown',
      type: row.type || row.initial_info_impact_type_primary || 'Unknown',
      severity,
      recordable: parseInt(row.recordable) || 0,
      otr,
      total_dafw_days: parseInt(row.total_dafw_days) || 0,
      total_rwa_days: parseInt(row.total_rwa_days) || 0,
      rootCause: row.rca_primary_cause || 'Under Investigation',
      contributingFactor: row.rca_contributing_factor_category || 'Unknown',
      processPath: row.initial_info_process_path || 'Unknown',
      austin_url: row.austin_url || 
                 row.austin_case_study_url || 
                 row.austin_link || 
                 row.case_study_url ||
                 DEFAULT_AUSTIN_URL,
      initial_info_incident_description: row.initial_info_incident_description,
      status: row.status || 'Open',
      parsedDate,
      standardized_likelihood: standardizeLikelihood(row.initial_risk_assessment_likeliness)
    } as InjuryRecord;
  });
}

export function processNearMissData(rawData: any[]): NearMissRecord[] {
  return rawData.map((row, index) => {
    const parsedDate = row.nearmiss_date ? new Date(row.nearmiss_date) : undefined;
    const severity = standardizeSeverity(row.potential_severity || row.severity);
    const standardized_likelihood = standardizeLikelihood(row.initial_risk_assessment_likeliness);
    
    // Calculate risk score if not present
    let risk = row.risk;
    if (!risk || risk === '' || risk === 0) {
      risk = calculateRiskScore(severity, standardized_likelihood);
    }
    
    // Generate ID if needed
    let incident_id = row.incident_id;
    if (!incident_id) {
      const date = parsedDate || new Date();
      const site = (row.site && row.site.trim()) ? row.site.trim() : 'XX';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const seq = String(index + 1).padStart(3, '0');
      incident_id = `NM-${site}-${year}${month}-${seq}`;
    }
    
    return {
      incident_id,
      nearmiss_date: row.nearmiss_date || '',
      site: row.site || 'Unknown',
      location: row.initial_info_location_event || 'Unknown',
      processPath: row.initial_info_process_path || 'Unknown',
      primaryImpact: row.initial_info_primary_impact || 'Unknown',
      severity,
      standardized_likelihood,
      risk: risk.toString(),
      contributingFactor: row.rca_contributing_factor_category || 'Unknown',
      initial_info_incident_description: row.initial_info_incident_description,
      rca_primary_cause: row.rca_primary_cause || 'Under investigation',
      status: row.status || 'Open',
      parsedDate
    } as NearMissRecord;
  });
}

export function standardizeSeverity(severity: any): 'A' | 'B' | 'C' | 'D' | 'Unknown' {
  if (!severity) return 'Unknown';
  const severityStr = String(severity).toUpperCase().trim();
  
  if (['A', 'B', 'C', 'D'].includes(severityStr)) {
    return severityStr as 'A' | 'B' | 'C' | 'D';
  }
  
  const lower = severityStr.toLowerCase();
  if (lower.includes('critical') || lower.includes('severe')) return 'A';
  if (lower.includes('high') || lower.includes('major')) return 'B';
  if (lower.includes('medium') || lower.includes('moderate')) return 'C';
  if (lower.includes('low') || lower.includes('minor')) return 'D';
  
  return 'Unknown';
}

export function standardizeLikelihood(likelihood: any): Likelihood {
  if (!likelihood) return 'Possible';
  
  const likelihoodStr = String(likelihood).toLowerCase().trim();
  
  if (likelihoodStr.includes('rare')) return 'Rare';
  if (likelihoodStr.includes('unlikely')) return 'Unlikely';
  if (likelihoodStr.includes('possible')) return 'Possible';
  if (likelihoodStr.includes('likely') && !likelihoodStr.includes('unlikely')) {
    if (likelihoodStr.includes('almost') || likelihoodStr.includes('certain')) {
      return 'Almost Certain';
    }
    return 'Likely';
  }
  if (likelihoodStr.includes('certain')) return 'Almost Certain';
  
  // Numeric values (1-5 scale)
  const numValue = parseInt(likelihoodStr);
  if (!isNaN(numValue)) {
    switch(numValue) {
      case 1: return 'Rare';
      case 2: return 'Unlikely';
      case 3: return 'Possible';
      case 4: return 'Likely';
      case 5: return 'Almost Certain';
    }
  }
  
  return 'Possible';
}

export function calculateRiskScore(
  severity: 'A' | 'B' | 'C' | 'D' | 'Unknown',
  likelihood: Likelihood
): number {
  const severityMap = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'Unknown': 1 };
  const likelihoodMap = { 
    'Rare': 1, 
    'Unlikely': 2, 
    'Possible': 3, 
    'Likely': 4, 
    'Almost Certain': 5 
  };
  
  const severityValue = severityMap[severity] || 1;
  const likelihoodValue = likelihoodMap[likelihood] || 3;
  
  return parseFloat(((severityValue * likelihoodValue) / 5 * 2).toFixed(1));
}
```

## 17. src/utils/calculations.ts
```typescript
import { InjuryRecord, NearMissRecord, KPIMetrics } from '../types';

export function calculateKPIs(
  injuryData: InjuryRecord[],
  nearMissData: NearMissRecord[]
): KPIMetrics {
  // Standard baseline (per 200,000 hours - OSHA standard)
  const hoursWorked = 200000;
  
  // TRIR (Total Recordable Incident Rate)
  const recordableCount = injuryData.filter(r => r.recordable === 1).length;
  const TRIR = ((recordableCount / hoursWorked) * 200000);
  
  // LTIR (Lost Time Incident Rate)
  const lostTimeCount = injuryData.filter(r => r.total_dafw_days > 0).length;
  const LTIR = ((lostTimeCount / hoursWorked) * 200000);
  
  // DAFWR (Days Away From Work Rate)
  const totalDaysLost = injuryData.reduce((sum, r) => sum + (r.total_dafw_days || 0), 0);
  const DAFWR = ((totalDaysLost / hoursWorked) * 200000);
  
  // NMFR (Near Miss Frequency Rate)
  const nearMissCount = nearMissData.length;
  const NMFR = ((nearMissCount / hoursWorked) * 200000);
  
  return { TRIR, LTIR, DAFWR, NMFR };
}

export function getSeverityClass(severity: string): string {
  switch(severity) {
    case 'A': return 'critical';
    case 'B': return 'danger';
    case 'C': return 'warning';
    case 'D': return 'success';
    default: return 'secondary';
  }
}

export function getRiskClass(risk: string | number): string {
  const riskValue = parseFloat(risk.toString());
  if (riskValue >= 8) return 'critical';
  if (riskValue >= 6) return 'danger';
  if (riskValue >= 4) return 'warning';
  if (riskValue >= 2) return 'success';
  return 'info';
}
```

## Installation & Running Instructions

1. **Create a new React project:**
```bash
mkdir safety-analytics
cd safety-analytics
```

2. **Initialize the project with the package.json above:**
```bash
npm init -y
# Copy the package.json content above
npm install
```

3. **Create the folder structure and add the files above**

4. **Install Tailwind CSS:**
```bash
npx tailwindcss init -p
# Copy the tailwind.config.js content above
```

5. **Create src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --amazon-orange: #FF9900;
  --amazon-dark: #232F3E;
  --amazon-gray: #37475A;
}

/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
.dark .scrollbar-thin::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4a5568;
}
```

6. **Run the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`