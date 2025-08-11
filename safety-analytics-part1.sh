#!/bin/bash

# Safety Analytics Platform - Complete Implementation Script
# This script creates all necessary files for the complete platform

echo "🚀 Creating Complete Safety Analytics Platform..."

# Create directory structure
mkdir -p src/components/{Dashboard,InjuryModule,NearMissModule,CombinedAnalytics,Reports,Actions,Common,Layout,Charts}
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/styles
mkdir -p public/icons
mkdir -p public/splash

# 1. Create Types and Interfaces
cat > src/types/index.ts << 'EOF'
export interface InjuryRecord {
  case_number: string;
  incident_date: string;
  incident_time?: string;
  site: string;
  bodyPart: string;
  type?: string;
  severity: 'A' | 'B' | 'C' | 'D' | 'Unknown';
  recordable: 0 | 1;
  otr: 'yes' | 'no';
  total_dafw_days: number;
  total_rwa_days: number;
  rootCause: string;
  contributingFactor?: string;
  processPath: string;
  austin_url?: string;
  initial_info_incident_description?: string;
  status?: string;
  parsedDate?: Date;
  standardized_likelihood?: Likelihood;
}

export interface NearMissRecord {
  incident_id: string;
  nearmiss_date: string;
  site: string;
  location: string;
  processPath: string;
  primaryImpact: string;
  severity: 'A' | 'B' | 'C' | 'D' | 'Unknown';
  standardized_likelihood: Likelihood;
  risk: number;
  contributingFactor?: string;
  initial_info_incident_description?: string;
  rca_primary_cause?: string;
  status?: string;
  parsedDate?: Date;
}

export interface ActionItem {
  id: string;
  incidentId: string;
  type: 'injury' | 'nearmiss';
  action: string;
  responsible: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdDate: string;
  completedDate?: string;
  notes?: string;
}

export type Likelihood = 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';
export type Severity = 'A' | 'B' | 'C' | 'D' | 'Unknown';

export interface SafetyState {
  injury: {
    rawData: InjuryRecord[];
    filteredData: InjuryRecord[];
    currentPage: number;
    timelinePage: number;
  };
  nearMiss: {
    rawData: NearMissRecord[];
    filteredData: NearMissRecord[];
    currentPage: number;
    timelinePage: number;
  };
  actions: ActionItem[];
  currentModule: Module;
  theme: 'light' | 'dark';
  itemsPerPage: number;
  filters: FilterState;
}

export type Module = 'overview' | 'injury' | 'nearmiss' | 'combined' | 'reports' | 'actions';

export interface KPIMetrics {
  TRIR: number;
  LTIR: number;
  DAFWR: number;
  NMFR: number;
  totalIncidents: number;
  recordableIncidents: number;
  lostTimeIncidents: number;
  nearMissCount: number;
  avgRiskScore: number;
  criticalEvents: number;
}

export interface FilterState {
  site?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  bodyPart?: string;
  processPath?: string;
  [key: string]: any;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}
EOF

# 2. Create Utility Functions
cat > src/utils/dataProcessing.ts << 'EOF'
import { InjuryRecord, NearMissRecord, Severity, Likelihood, KPIMetrics } from '../types';
import { parse, format } from 'date-fns';

const BASELINE_HOURS = 200000; // Standard baseline for calculations

export function standardizeSeverity(severity: string): Severity {
  const normalized = severity?.toString().toUpperCase().trim();
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized as Severity;
  }
  return 'Unknown';
}

export function standardizeLikelihood(likelihood: string): Likelihood {
  const normalized = likelihood?.toLowerCase().trim();
  const mapping: Record<string, Likelihood> = {
    'rare': 'Rare',
    '1': 'Rare',
    'unlikely': 'Unlikely',
    '2': 'Unlikely',
    'possible': 'Possible',
    '3': 'Possible',
    'likely': 'Likely',
    '4': 'Likely',
    'almost certain': 'Almost Certain',
    'almost_certain': 'Almost Certain',
    'almostcertain': 'Almost Certain',
    '5': 'Almost Certain'
  };
  return mapping[normalized] || 'Possible';
}

export function calculateRiskScore(severity: Severity, likelihood: Likelihood): number {
  const severityScores: Record<Severity, number> = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'Unknown': 1
  };

  const likelihoodScores: Record<Likelihood, number> = {
    'Almost Certain': 5,
    'Likely': 4,
    'Possible': 3,
    'Unlikely': 2,
    'Rare': 1
  };

  const severityScore = severityScores[severity] || 1;
  const likelihoodScore = likelihoodScores[likelihood] || 3;
  
  return ((severityScore * likelihoodScore) / 5) * 2; // Scale 0-10
}

export function parseDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Try multiple date formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd',
    'dd-MM-yyyy',
    'MM-dd-yyyy'
  ];

  for (const fmt of formats) {
    try {
      const parsed = parse(dateString, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback to native Date parsing
  const fallback = new Date(dateString);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function calculateKPIs(
  injuryData: InjuryRecord[],
  nearMissData: NearMissRecord[]
): KPIMetrics {
  const recordableCount = injuryData.filter(d => d.recordable === 1).length;
  const lostTimeCount = injuryData.filter(d => d.otr === 'yes').length;
  const totalDAFW = injuryData.reduce((sum, d) => sum + (d.total_dafw_days || 0), 0);
  
  const riskScores = nearMissData.map(d => 
    calculateRiskScore(d.severity, d.standardized_likelihood)
  );
  const avgRiskScore = riskScores.length > 0 
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
    : 0;

  const criticalEvents = [
    ...injuryData.filter(d => d.severity === 'A' || d.severity === 'B'),
    ...nearMissData.filter(d => d.severity === 'A' || d.severity === 'B')
  ].length;

  return {
    TRIR: (recordableCount / BASELINE_HOURS) * 200000,
    LTIR: (lostTimeCount / BASELINE_HOURS) * 200000,
    DAFWR: (totalDAFW / BASELINE_HOURS) * 200000,
    NMFR: (nearMissData.length / BASELINE_HOURS) * 200000,
    totalIncidents: injuryData.length,
    recordableIncidents: recordableCount,
    lostTimeIncidents: lostTimeCount,
    nearMissCount: nearMissData.length,
    avgRiskScore,
    criticalEvents
  };
}

export function filterData<T extends InjuryRecord | NearMissRecord>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter(record => {
    // Site filter
    if (filters.site && filters.site !== 'all') {
      if (record.site !== filters.site) return false;
    }

    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      if (record.severity !== filters.severity) return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const recordDate = record.parsedDate || parseDate(
        'incident_date' in record ? record.incident_date : record.nearmiss_date
      );
      
      if (filters.dateFrom) {
        const fromDate = parseDate(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = parseDate(filters.dateTo);
        if (recordDate > toDate) return false;
      }
    }

    // Body part filter (injury only)
    if (filters.bodyPart && filters.bodyPart !== 'all' && 'bodyPart' in record) {
      if (record.bodyPart !== filters.bodyPart) return false;
    }

    // Process path filter
    if (filters.processPath && filters.processPath !== 'all') {
      if (record.processPath !== filters.processPath) return false;
    }

    return true;
  });
}

export function aggregateByMonth<T extends { parsedDate?: Date }>(
  data: T[]
): { month: string; count: number }[] {
  const monthCounts: Record<string, number> = {};

  data.forEach(record => {
    if (record.parsedDate) {
      const monthKey = format(record.parsedDate, 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  return Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: format(parse(month, 'yyyy-MM', new Date()), 'MMM yyyy'),
      count
    }));
}

export function generateColors(count: number): string[] {
  const baseColors = [
    '#FF9900', // Amazon Orange
    '#232F3E', // Amazon Dark
    '#4CAF50', // Success Green
    '#FFC107', // Warning Yellow
    '#FF5722', // Danger Red
    '#2196F3', // Info Blue
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}
EOF

# 3. Create CSV Parser Utility
cat > src/utils/csvParser.ts << 'EOF'
import Papa from 'papaparse';
import { InjuryRecord, NearMissRecord } from '../types';
import { standardizeSeverity, standardizeLikelihood, parseDate, calculateRiskScore } from './dataProcessing';

export function parseInjuryCSV(file: File): Promise<InjuryRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row: any) => ({
            case_number: row.case_number || row['Case Number'] || '',
            incident_date: row.incident_date || row['Incident Date'] || '',
            incident_time: row.incident_time || row['Incident Time'] || '',
            site: row.site || row['Site'] || '',
            bodyPart: row.initial_info_principal_body_part || row.bodyPart || row['Body Part'] || '',
            type: row.type || row['Type'] || '',
            severity: standardizeSeverity(row.severity || row['Severity'] || 'Unknown'),
            recordable: parseInt(row.recordable || row['Recordable'] || 0) as 0 | 1,
            otr: (row.otr || row['OTR'] || 'no').toLowerCase() === 'yes' ? 'yes' : 'no',
            total_dafw_days: parseInt(row.total_dafw_days || row['DAFW Days'] || 0),
            total_rwa_days: parseInt(row.total_rwa_days || row['RWA Days'] || 0),
            rootCause: row.rca_primary_cause || row.rootCause || row['Root Cause'] || '',
            contributingFactor: row.contributingFactor || row['Contributing Factor'] || '',
            processPath: row.processPath || row['Process Path'] || '',
            austin_url: row.austin_url || '',
            initial_info_incident_description: row.initial_info_incident_description || '',
            status: row.status || 'Open',
            parsedDate: parseDate(row.incident_date || row['Incident Date'] || '')
          }));
          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function parseNearMissCSV(file: File): Promise<NearMissRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row: any) => {
            const severity = standardizeSeverity(row.potential_severity || row.severity || row['Severity'] || 'Unknown');
            const likelihood = standardizeLikelihood(
              row.initial_risk_assessment_likeliness || 
              row.likelihood || 
              row['Likelihood'] || 
              'Possible'
            );
            
            return {
              incident_id: row.incident_id || row['Incident ID'] || '',
              nearmiss_date: row.nearmiss_date || row['Near Miss Date'] || '',
              site: row.site || row['Site'] || '',
              location: row.initial_info_location_event || row.location || row['Location'] || '',
              processPath: row.processPath || row['Process Path'] || '',
              primaryImpact: row.primaryImpact || row['Primary Impact'] || '',
              severity,
              standardized_likelihood: likelihood,
              risk: row.risk || calculateRiskScore(severity, likelihood),
              contributingFactor: row.contributingFactor || row['Contributing Factor'] || '',
              initial_info_incident_description: row.initial_info_incident_description || '',
              rca_primary_cause: row.rca_primary_cause || '',
              status: row.status || 'Open',
              parsedDate: parseDate(row.nearmiss_date || row['Near Miss Date'] || '')
            };
          });
          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
EOF

# 4. Create Chart Configuration
cat > src/utils/chartConfig.ts << 'EOF'
import { ChartOptions } from 'chart.js';

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      padding: 10,
      cornerRadius: 4
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
};

export const pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 15,
        font: {
          size: 12
        },
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels && data.datasets.length > 0) {
            const dataset = data.datasets[0];
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            
            return data.labels.map((label, i) => {
              const value = dataset.data[i] as number;
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label}: ${percentage}%`,
                fillStyle: Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[i] 
                  : dataset.backgroundColor,
                hidden: false,
                index: i
              };
            });
          }
          return [];
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

export const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
};

export const stackedBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      }
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  }
};
EOF

# 5. Create Main Context
cat > src/contexts/SafetyContext.tsx << 'EOF'
import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { SafetyState, InjuryRecord, NearMissRecord, ActionItem, Module } from '../types';

type SafetyAction =
  | { type: 'SET_INJURY_DATA'; payload: InjuryRecord[] }
  | { type: 'SET_NEARMISS_DATA'; payload: NearMissRecord[] }
  | { type: 'SET_FILTERED_INJURY'; payload: InjuryRecord[] }
  | { type: 'SET_FILTERED_NEARMISS'; payload: NearMissRecord[] }
  | { type: 'ADD_ACTION'; payload: ActionItem }
  | { type: 'UPDATE_ACTION'; payload: ActionItem }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'SET_MODULE'; payload: Module }
  | { type: 'SET_PAGE'; module: 'injury' | 'nearMiss'; page: number }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'CLEAR_DATA' };

interface SafetyContextType {
  state: SafetyState;
  dispatch: Dispatch<SafetyAction>;
}

const initialState: SafetyState = {
  injury: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  nearMiss: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  actions: [],
  currentModule: 'overview',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  itemsPerPage: 15,
  filters: {}
};

function safetyReducer(state: SafetyState, action: SafetyAction): SafetyState {
  switch (action.type) {
    case 'SET_INJURY_DATA':
      return {
        ...state,
        injury: {
          ...state.injury,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    
    case 'SET_NEARMISS_DATA':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    
    case 'SET_FILTERED_INJURY':
      return {
        ...state,
        injury: {
          ...state.injury,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    
    case 'SET_FILTERED_NEARMISS':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    
    case 'ADD_ACTION':
      return {
        ...state,
        actions: [...state.actions, action.payload]
      };
    
    case 'UPDATE_ACTION':
      return {
        ...state,
        actions: state.actions.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    
    case 'DELETE_ACTION':
      return {
        ...state,
        actions: state.actions.filter(a => a.id !== action.payload)
      };
    
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload
      };
    
    case 'SET_PAGE':
      if (action.module === 'injury') {
        return {
          ...state,
          injury: {
            ...state.injury,
            currentPage: action.page
          }
        };
      } else {
        return {
          ...state,
          nearMiss: {
            ...state.nearMiss,
            currentPage: action.page
          }
        };
      }
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return {
        ...state,
        theme: newTheme
      };
    
    case 'CLEAR_DATA':
      return {
        ...state,
        injury: {
          rawData: [],
          filteredData: [],
          currentPage: 1,
          timelinePage: 1
        },
        nearMiss: {
          rawData: [],
          filteredData: [],
          currentPage: 1,
          timelinePage: 1
        },
        actions: [],
        filters: {}
      };
    
    default:
      return state;
  }
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(safetyReducer, initialState);

  return (
    <SafetyContext.Provider value={{ state, dispatch }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
EOF

# Continue in next part...
echo "Part 1 complete. Run install_part2.sh to continue..."