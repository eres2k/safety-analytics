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
  risk: string;
  contributingFactor?: string;
  initial_info_incident_description?: string;
  rca_primary_cause?: string;
  status?: string;
  parsedDate?: Date;
}

export type Likelihood = 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';

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
  currentModule: Module;
  theme: 'light' | 'dark';
  itemsPerPage: number;
}

export type Module = 'overview' | 'injury' | 'nearmiss' | 'combined' | 'reports' | 'actions';

export interface KPIMetrics {
  TRIR: number;
  LTIR: number;
  DAFWR: number;
  NMFR: number;
}

export interface FilterState {
  site?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}
