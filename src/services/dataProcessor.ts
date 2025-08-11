export function processInjuryData(rawData: any[]): any[] {
  return rawData.map((row, index) => ({
    ...row,
    case_number: row.case_number || `CASE-${index + 1}`,
    parsedDate: row.incident_date ? new Date(row.incident_date) : undefined
  }));
}

export function processNearMissData(rawData: any[]): any[] {
  return rawData.map((row, index) => ({
    ...row,
    incident_id: row.incident_id || `NM-${index + 1}`,
    parsedDate: row.nearmiss_date ? new Date(row.nearmiss_date) : undefined
  }));
}
