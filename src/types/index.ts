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
