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
