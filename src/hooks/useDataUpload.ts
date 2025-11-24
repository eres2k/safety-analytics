/**
 * Data Upload Hook
 * Handles CSV file upload and processing
 */

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import type { InjuryRecord, NearMissRecord, InspectionRecord } from '@/types';
import { useAppStore } from '@/store';
import { calculateQualityMetrics } from '@/lib/calculations';

type DataType = 'injury' | 'nearMiss' | 'inspection';

interface UploadResult {
  success: boolean;
  recordCount: number;
  error?: string;
}

export function useDataUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const setInjuries = useAppStore(state => state.setInjuries);
  const setNearMisses = useAppStore(state => state.setNearMisses);
  const setInspections = useAppStore(state => state.setInspections);
  const setLoading = useAppStore(state => state.setLoading);

  const uploadFile = useCallback(
    async (file: File, dataType: DataType): Promise<UploadResult> => {
      setIsUploading(true);
      setUploadProgress(0);
      setLoading(dataType === 'injury' ? 'injuries' : dataType === 'nearMiss' ? 'nearMisses' : 'inspections', true);

      try {
        const result = await parseCSVFile(file);

        if (result.errors.length > 0) {
          return {
            success: false,
            recordCount: 0,
            error: `Parse errors: ${result.errors.map(e => e.message).join(', ')}`,
          };
        }

        const data = result.data;
        setUploadProgress(50);

        // Process based on type
        switch (dataType) {
          case 'injury': {
            const injuries = processInjuryData(data);
            setInjuries(injuries);

            // Calculate quality metrics
            const requiredFields = [
              'site',
              'date',
              'incidentType',
              'severity',
              'description',
              'rootCause',
              'correctiveAction',
            ];
            const quality = calculateQualityMetrics(injuries, requiredFields);
            useAppStore.setState({ injuryQuality: quality });

            setUploadProgress(100);
            return {
              success: true,
              recordCount: injuries.length,
            };
          }

          case 'nearMiss': {
            const nearMisses = processNearMissData(data);
            setNearMisses(nearMisses);

            // Calculate quality metrics
            const requiredFields = [
              'site',
              'date',
              'category',
              'severity',
              'description',
              'potentialImpact',
              'correctiveAction',
            ];
            const quality = calculateQualityMetrics(nearMisses, requiredFields);
            useAppStore.setState({ nearMissQuality: quality });

            setUploadProgress(100);
            return {
              success: true,
              recordCount: nearMisses.length,
            };
          }

          case 'inspection': {
            const inspections = processInspectionData(data);
            setInspections(inspections);

            setUploadProgress(100);
            return {
              success: true,
              recordCount: inspections.length,
            };
          }

          default:
            throw new Error('Invalid data type');
        }
      } catch (error) {
        return {
          success: false,
          recordCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setLoading(dataType === 'injury' ? 'injuries' : dataType === 'nearMiss' ? 'nearMisses' : 'inspections', false);
      }
    },
    [setInjuries, setNearMisses, setInspections, setLoading]
  );

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
}

/**
 * Parse CSV file using PapaParse
 */
function parseCSVFile(file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: resolve,
      error: reject,
    });
  });
}

/**
 * Process injury data
 */
function processInjuryData(data: Record<string, string>[]): InjuryRecord[] {
  return data.map((row) => ({
    site: row.site || row.Site || '',
    date: row.date || row.Date || '',
    employeeId: row.employeeId || row.EmployeeID || row['Employee ID'] || '',
    incidentType: row.incidentType || row.IncidentType || row['Incident Type'] || '',
    severity: row.severity || row.Severity || '',
    bodyPart: row.bodyPart || row.BodyPart || row['Body Part'] || '',
    location: row.location || row.Location || '',
    processPath: row.processPath || row.ProcessPath || row['Process Path'] || '',
    primaryImpact: row.primaryImpact || row.PrimaryImpact || row['Primary Impact'] || '',
    description: row.description || row.Description || '',
    rootCause: row.rootCause || row.RootCause || row['Root Cause'] || '',
    correctiveAction: row.correctiveAction || row.CorrectiveAction || row['Corrective Action'] || '',
    daysAway: parseIntOrUndefined(row.daysAway || row.DaysAway || row['Days Away']),
    restricted: parseBooleanOrUndefined(row.restricted || row.Restricted),
    recordable: parseBooleanOrUndefined(row.recordable || row.Recordable),
    dateReported: row.dateReported || row.DateReported || row['Date Reported'] || '',
    investigationComplete: parseBooleanOrUndefined(
      row.investigationComplete || row.InvestigationComplete || row['Investigation Complete']
    ),
    investigator: row.investigator || row.Investigator || '',
    witnessCount: parseIntOrUndefined(row.witnessCount || row.WitnessCount || row['Witness Count']),
    timeOfIncident: row.timeOfIncident || row.TimeOfIncident || row['Time of Incident'] || '',
    shift: row.shift || row.Shift || '',
    department: row.department || row.Department || '',
    costEstimate: parseIntOrUndefined(row.costEstimate || row.CostEstimate || row['Cost Estimate']),
  }));
}

/**
 * Process near miss data
 */
function processNearMissData(data: Record<string, string>[]): NearMissRecord[] {
  return data.map((row) => ({
    site: row.site || row.Site || '',
    date: row.date || row.Date || '',
    reportedBy: row.reportedBy || row.ReportedBy || row['Reported By'] || '',
    category: row.category || row.Category || '',
    severity: row.severity || row.Severity || '',
    location: row.location || row.Location || '',
    processPath: row.processPath || row.ProcessPath || row['Process Path'] || '',
    description: row.description || row.Description || '',
    potentialImpact: row.potentialImpact || row.PotentialImpact || row['Potential Impact'] || '',
    correctiveAction: row.correctiveAction || row.CorrectiveAction || row['Corrective Action'] || '',
    status: row.status || row.Status || 'Open',
    dateReported: row.dateReported || row.DateReported || row['Date Reported'] || '',
    investigationComplete: parseBooleanOrUndefined(
      row.investigationComplete || row.InvestigationComplete || row['Investigation Complete']
    ),
    investigator: row.investigator || row.Investigator || '',
    priority: row.priority || row.Priority || '',
    likelihood: row.likelihood || row.Likelihood || '',
    riskScore: parseIntOrUndefined(row.riskScore || row.RiskScore || row['Risk Score']),
  }));
}

/**
 * Process inspection data
 */
function processInspectionData(data: Record<string, string>[]): InspectionRecord[] {
  return data.map((row) => ({
    site: row.site || row.Site || '',
    inspectionType: row.inspectionType || row.InspectionType || row['Inspection Type'] || '',
    scheduledDate: row.scheduledDate || row.ScheduledDate || row['Scheduled Date'] || '',
    completedDate: row.completedDate || row.CompletedDate || row['Completed Date'] || '',
    status: (row.status || row.Status || 'Upcoming') as InspectionRecord['status'],
    inspector: row.inspector || row.Inspector || '',
    score: parseIntOrUndefined(row.score || row.Score),
    findings: parseIntOrUndefined(row.findings || row.Findings),
    criticalFindings: parseIntOrUndefined(row.criticalFindings || row.CriticalFindings || row['Critical Findings']),
    dueDate: row.dueDate || row.DueDate || row['Due Date'] || '',
    owner: row.owner || row.Owner || '',
    frequency: row.frequency || row.Frequency || '',
    nextDueDate: row.nextDueDate || row.NextDueDate || row['Next Due Date'] || '',
  }));
}

/**
 * Helper: Parse integer or return undefined
 */
function parseIntOrUndefined(value: string | undefined): number | undefined {
  if (!value || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Helper: Parse boolean or return undefined
 */
function parseBooleanOrUndefined(value: string | undefined): boolean | undefined {
  if (!value || value === '') return undefined;
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === 'yes' || lower === '1') return true;
  if (lower === 'false' || lower === 'no' || lower === '0') return false;
  return undefined;
}
