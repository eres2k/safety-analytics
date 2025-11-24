/**
 * Core Type Definitions for Safety Analytics Platform
 * Preserves all data structures from the legacy system
 */

// ============================================================================
// Injury & Illness Types
// ============================================================================

export interface InjuryRecord {
  site: string;
  date: string;
  employeeId: string;
  incidentType: string;
  severity: string;
  bodyPart: string;
  location: string;
  processPath: string;
  primaryImpact: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  daysAway?: number;
  restricted?: boolean;
  recordable?: boolean;
  dateReported?: string;
  investigationComplete?: boolean;
  investigator?: string;
  witnessCount?: number;
  timeOfIncident?: string;
  shift?: string;
  department?: string;
  costEstimate?: number;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Near Miss Types
// ============================================================================

export interface NearMissRecord {
  site: string;
  date: string;
  reportedBy: string;
  category: string;
  severity: string;
  location: string;
  processPath: string;
  description: string;
  potentialImpact: string;
  correctiveAction: string;
  status: string;
  dateReported?: string;
  investigationComplete?: boolean;
  investigator?: string;
  priority?: string;
  likelihood?: string;
  riskScore?: number;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Inspection Types
// ============================================================================

export interface InspectionRecord {
  site: string;
  inspectionType: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Completed' | 'Overdue' | 'Upcoming' | 'In Progress';
  inspector: string;
  score?: number;
  findings?: number;
  criticalFindings?: number;
  dueDate?: string;
  owner?: string;
  frequency?: string;
  nextDueDate?: string;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// KPI Types
// ============================================================================

export interface SafetyKPIs {
  // Core metrics
  trir: number;           // Total Recordable Incident Rate
  ltir: number;           // Lost Time Incident Rate
  dafwr: number;          // Days Away From Work Rate
  nmfr: number;           // Near Miss Frequency Rate
  safetyIndex: number;    // Overall safety index
  recordableRate: number; // Recordable incident rate

  // Counts
  totalInjuries: number;
  recordableInjuries: number;
  lostTimeCases: number;
  nearMisses: number;

  // Trend data
  trend30Days: number;
  trend60Days: number;
  trend90Days: number;

  // Advanced metrics
  severityScore: number;
  leadIndicatorScore: number;
  lagIndicatorScore: number;
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
  }>;
}

export interface RiskMatrixData {
  severity: number;
  likelihood: number;
  count: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  items: Array<InjuryRecord | NearMissRecord>;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterState {
  site: string[];
  severity: string[];
  dateRange: DateRange;
  bodyPart: string[];
  location: string[];
  processPath: string[];
  category: string[];
  status: string[];
  searchQuery: string;
}

// ============================================================================
// Module Types
// ============================================================================

export type ModuleName =
  | 'overview'
  | 'injury'
  | 'nearMiss'
  | 'combined'
  | 'inspections'
  | 'reports'
  | 'actions';

export type InjurySubView =
  | 'dashboard'
  | 'risk-matrix'
  | 'timeline'
  | 'quality'
  | 'advanced';

export type NearMissSubView =
  | 'dashboard'
  | 'risk-matrix'
  | 'timeline'
  | 'quality'
  | 'advanced';

// ============================================================================
// Quality Assessment Types
// ============================================================================

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overallScore: number;
  missingFields: string[];
  duplicateCount: number;
  avgWordCount: number;
  recordsAssessed: number;
}

// ============================================================================
// Action Item Types
// ============================================================================

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'Immediate' | 'Short-term' | 'Long-term';
  status: 'Open' | 'In Progress' | 'Completed';
  owner: string;
  dueDate: string;
  createdDate: string;
  site: string;
  relatedIncident?: string;
  category: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ReportConfig {
  type: 'injury' | 'nearMiss' | 'wbr' | 'combined';
  dateRange: DateRange;
  sites: string[];
  includeCharts: boolean;
  includeData: boolean;
  format: 'pdf' | 'excel';
}

// ============================================================================
// State Types
// ============================================================================

export interface AppState {
  // Data
  injuries: InjuryRecord[];
  nearMisses: NearMissRecord[];
  inspections: InspectionRecord[];
  actions: ActionItem[];

  // Filtered data
  filteredInjuries: InjuryRecord[];
  filteredNearMisses: NearMissRecord[];
  filteredInspections: InspectionRecord[];

  // UI State
  currentModule: ModuleName;
  injurySubView: InjurySubView;
  nearMissSubView: NearMissSubView;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;

  // Filters
  injuryFilters: FilterState;
  nearMissFilters: FilterState;
  inspectionFilters: FilterState;

  // Pagination
  injuryPage: number;
  nearMissPage: number;
  inspectionPage: number;
  itemsPerPage: number;

  // Loading states
  loading: {
    injuries: boolean;
    nearMisses: boolean;
    inspections: boolean;
    reports: boolean;
  };

  // Quality metrics
  injuryQuality: QualityMetrics | null;
  nearMissQuality: QualityMetrics | null;
}

// ============================================================================
// Intelligent Feature Types
// ============================================================================

export interface PredictiveInsight {
  id: string;
  type: 'risk-prediction' | 'trend-alert' | 'pattern-detection' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  confidence: number;
  relatedData: string[];
  suggestedActions: string[];
  timestamp: Date;
}

export interface SmartRecommendation {
  id: string;
  category: string;
  recommendation: string;
  reasoning: string;
  priority: number;
  impact: 'low' | 'medium' | 'high';
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
  metric: string;
  direction: 'improving' | 'stable' | 'worsening';
  changePercent: number;
  prediction: number;
  confidence: number;
  factors: string[];
}

// ============================================================================
// Export Helper Types
// ============================================================================

export type ThemeMode = 'light' | 'dark';
export type SortDirection = 'asc' | 'desc';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png';
