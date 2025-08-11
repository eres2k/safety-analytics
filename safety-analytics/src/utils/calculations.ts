export function calculateKPIs(injuryData: any[], nearMissData: any[]) {
  const hoursWorked = 200000;
  const recordableCount = injuryData.filter(r => r.recordable === 1).length;
  const TRIR = ((recordableCount / hoursWorked) * 200000);
  const lostTimeCount = injuryData.filter(r => r.total_dafw_days > 0).length;
  const LTIR = ((lostTimeCount / hoursWorked) * 200000);
  const totalDaysLost = injuryData.reduce((sum, r) => sum + (r.total_dafw_days || 0), 0);
  const DAFWR = ((totalDaysLost / hoursWorked) * 200000);
  const nearMissCount = nearMissData.length;
  const NMFR = ((nearMissCount / hoursWorked) * 200000);
  return { TRIR, LTIR, DAFWR, NMFR };
}
