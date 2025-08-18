// Additional helper functions for data analysis
function calculateTrendData(data, dateField, periodDays = 30) {
    const now = new Date();
    const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const currentPeriod = data.filter(d => {
        const date = new Date(d[dateField]);
        return date >= periodStart;
    }).length;

    const previousStart = new Date(periodStart.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const previousPeriod = data.filter(d => {
        const date = new Date(d[dateField]);
        return date >= previousStart && date < periodStart;
    }).length;

    if (previousPeriod === 0) return 'N/A';

    const change = ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(0);
    return change > 0 ? `+${change}%` : `${change}%`;
}

function getIncidentDescription(incident, type) {
    if (type === 'injury') {
        const parts = [];
        if (incident.initial_info_incident_description) {
            parts.push(incident.initial_info_incident_description);
        }
        if (incident.initial_info_principal_body_part) {
            parts.push(`Affected: ${incident.initial_info_principal_body_part}`);
        }
        if (incident.rca_primary_cause) {
            parts.push(`Cause: ${incident.rca_primary_cause}`);
        }
        return parts.join(' | ') || 'No detailed description available';
    } else {
        const parts = [];
        if (incident.initial_info_incident_description) {
            parts.push(incident.initial_info_incident_description);
        }
        if (incident.initial_info_location_event) {
            parts.push(`Location: ${incident.initial_info_location_event}`);
        }
        if (incident.initial_info_primary_impact) {
            parts.push(`Impact: ${incident.initial_info_primary_impact}`);
        }
        return parts.join(' | ') || 'No detailed description available';
    }
}

function generatePDFReport(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Configuration
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const colors = {
        primary: [255, 153, 0],
        secondary: [35, 47, 62],
        critical: [183, 28, 28],
        high: [255, 87, 34],
        medium: [255, 193, 7],
        low: [76, 175, 80],
        lightGray: [245, 245, 245],
        darkGray: [66, 66, 66],
        white: [255, 255, 255]
    };

    // Helper functions
    const addPageNumber = (pageNum) => {
        doc.setFontSize(9);
        doc.setTextColor(...colors.darkGray);
        doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 10);
    };

    const addHeader = (title, subtitle) => {
        doc.setFillColor(...colors.primary);
        doc.rect(margin, margin, 40, 15, 'F');
        doc.setFontSize(12);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('SAFETY', margin + 20, margin + 9, { align: 'center' });

        doc.setFontSize(24);
        doc.setTextColor(...colors.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 50, margin + 10);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.darkGray);
        doc.text(subtitle, margin + 50, margin + 18);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, margin + 10);

        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(2);
        doc.line(margin, margin + 25, pageWidth - margin, margin + 25);

        return margin + 35;
    };

    const addSection = (y, title) => {
        doc.setFillColor(...colors.secondary);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, y + 5.5);
        return y + 12;
    };

    const addKPICard = (x, y, width, height, title, value, trend, color) => {
        doc.setFillColor(...colors.lightGray);
        doc.roundedRect(x, y, width, height, 3, 3, 'F');

        doc.setFillColor(...color);
        doc.rect(x, y, width, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(...colors.darkGray);
        doc.setFont('helvetica', 'normal');
        doc.text(title, x + width/2, y + 8, { align: 'center' });

        doc.setFontSize(20);
        doc.setTextColor(...colors.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text(value.toString(), x + width/2, y + 20, { align: 'center' });

        if (trend) {
            doc.setFontSize(9);
            const trendColor = trend.startsWith('+') ? colors.critical : colors.low;
            doc.setTextColor(...trendColor);
            doc.text(trend, x + width/2, y + 27, { align: 'center' });
        }
    };

    const addIncidentDetail = (y, incident, type) => {
        const boxHeight = 45;

        doc.setFillColor(...colors.white);
        doc.setDrawColor(...colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'FD');

        const severity = type === 'injury' ? incident.severity : incident.potential_severity;
        const severityColor = severity === 'A' || severity === 'Critical' ? colors.critical :
                            severity === 'B' || severity === 'High' ? colors.high :
                            severity === 'C' || severity === 'Medium' ? colors.medium : colors.low;

        doc.setFillColor(...severityColor);
        doc.rect(margin, y, 3, boxHeight, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.secondary);
        const caseId = type === 'injury' ? incident.case_number : incident.incident_id;
        doc.text(`${type === 'injury' ? 'Case' : 'Incident'}: ${caseId || 'N/A'}`, margin + 8, y + 8);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.darkGray);
        const dateStr = type === 'injury' ?
            new Date(incident.incident_date).toLocaleDateString() :
            new Date(incident.nearmiss_date).toLocaleDateString();
        doc.text(`Date: ${dateStr}`, margin + 80, y + 8);
        doc.text(`Site: ${incident.site || 'Unknown'}`, margin + 130, y + 8);

        doc.setFillColor(...severityColor);
        doc.roundedRect(pageWidth - margin - 30, y + 3, 25, 8, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text(severity || 'Unknown', pageWidth - margin - 17.5, y + 8, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.darkGray);

        if (type === 'injury') {
            doc.text(`Body Part: ${incident.initial_info_principal_body_part || 'Not specified'}`, margin + 8, y + 16);
            doc.text(`Root Cause: ${incident.rca_primary_cause || 'Under investigation'}`, margin + 8, y + 22);

            const description = incident.initial_info_incident_description || 'No description available';
            const lines = doc.splitTextToSize(description, contentWidth - 16);
            doc.text(lines.slice(0, 2), margin + 8, y + 30);

            if (incident.recordable === 1) {
                doc.setFillColor(...colors.critical);
                doc.circle(margin + 8, y + 40, 2, 'F');
                doc.text('Recordable', margin + 12, y + 41);
            }
            if (incident.total_dafw_days > 0) {
                doc.text(`DAFW: ${incident.total_dafw_days} days`, margin + 50, y + 41);
            }
        } else {
            doc.text(`Location: ${incident.initial_info_location_event || 'Not specified'}`, margin + 8, y + 16);
            doc.text(`Primary Impact: ${incident.initial_info_primary_impact || 'Not specified'}`, margin + 8, y + 22);

            const description = incident.initial_info_incident_description || 'No description available';
            const lines = doc.splitTextToSize(description, contentWidth - 16);
            doc.text(lines.slice(0, 2), margin + 8, y + 30);

            if (incident.risk !== undefined) {
                const riskScore = parseFloat(incident.risk).toFixed(1);
                doc.text(`Risk Score: ${riskScore}`, margin + 8, y + 41);
            }
        }

        return y + boxHeight + 5;
    };

    const addChart = (y, title, data, chartType = 'bar') => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.secondary);
        doc.text(title, margin, y);

        y += 8;

        const sortedData = Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const maxValue = Math.max(...sortedData.map(d => d[1]));

        sortedData.forEach(([label, value], index) => {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.darkGray);
            doc.text(label.substring(0, 20), margin, y);

            const barWidth = (value / maxValue) * (contentWidth - 80);
            const barColor = index === 0 ? colors.critical :
                           index === 1 ? colors.high :
                           index === 2 ? colors.medium : colors.low;

            doc.setFillColor(...barColor);
            doc.rect(margin + 60, y - 4, barWidth, 6, 'F');

            doc.text(value.toString(), margin + 65 + barWidth, y);

            y += 8;
        });

        return y + 5;
    };

    const selectTopIncidents = (data, type) => {
        const sorted = [...data].sort((a, b) => {
            const severityOrder = { 'A': 4, 'Critical': 4, 'B': 3, 'High': 3,
                                  'C': 2, 'Medium': 2, 'D': 1, 'Low': 1 };
            const severityA = type === 'injury' ? a.severity : a.potential_severity;
            const severityB = type === 'injury' ? b.severity : b.potential_severity;

            const sevDiff = (severityOrder[severityB] || 0) - (severityOrder[severityA] || 0);
            if (sevDiff !== 0) return sevDiff;

            const dateA = new Date(type === 'injury' ? a.incident_date : a.nearmiss_date);
            const dateB = new Date(type === 'injury' ? b.incident_date : b.nearmiss_date);
            return dateB - dateA;
        });

        const selected = [];
        const severities = new Set();

        for (const incident of sorted) {
            if (selected.length >= 3) break;

            const severity = type === 'injury' ? incident.severity : incident.potential_severity;
            if (!severities.has(severity) || selected.length < 3) {
                selected.push(incident);
                severities.add(severity);
            }
        }

        return selected;
    };

    let yPosition = 0;
    let pageNumber = 1;

    if (type === 'injury') {
        yPosition = addHeader('Injury & Illness Report', 'Workplace Health & Safety Analysis');

        yPosition = addSection(yPosition, 'EXECUTIVE SUMMARY');

        const injuryData = state.injury.filteredData;
        const recordableCount = injuryData.filter(d => d.recordable === 1).length;
        const totalDAFW = injuryData.reduce((sum, d) => sum + (parseInt(d.total_dafw_days) || 0), 0);
        const avgDAFW = recordableCount > 0 ? (totalDAFW / recordableCount).toFixed(1) : '0';

        const kpiY = yPosition;
        const kpiWidth = 35;
        const kpiHeight = 30;
        const kpiSpacing = 7;

        addKPICard(margin, kpiY, kpiWidth, kpiHeight, 'Total Cases',
                  injuryData.length, null, colors.primary);

        addKPICard(margin + kpiWidth + kpiSpacing, kpiY, kpiWidth, kpiHeight, 'Recordable',
                  recordableCount, `${((recordableCount/injuryData.length)*100).toFixed(0)}%`, colors.critical);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 2, kpiY, kpiWidth, kpiHeight, 'Total DAFW',
                  totalDAFW, `Avg: ${avgDAFW}`, colors.high);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 3, kpiY, kpiWidth, kpiHeight, 'Severity A',
                  injuryData.filter(d => d.severity === 'A').length, null, colors.critical);

        yPosition = kpiY + kpiHeight + 15;

        yPosition = addSection(yPosition, 'CRITICAL INCIDENTS - TOP 3');

        const topIncidents = selectTopIncidents(injuryData, 'injury');
        topIncidents.forEach(incident => {
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                pageNumber++;
                addPageNumber(pageNumber);
                yPosition = margin;
            }
            yPosition = addIncidentDetail(yPosition, incident, 'injury');
        });

        doc.addPage();
        pageNumber++;
        addPageNumber(pageNumber);
        yPosition = margin;

        yPosition = addSection(yPosition, 'SEVERITY ANALYSIS');

        const severityDist = {};
        injuryData.forEach(d => {
            severityDist[d.severity || 'Unknown'] = (severityDist[d.severity || 'Unknown'] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Incidents by Severity Level', severityDist);

        yPosition = addSection(yPosition + 10, 'BODY PARTS AFFECTED');
        const bodyParts = {};
        injuryData.forEach(d => {
            const part = d.initial_info_principal_body_part || 'Not specified';
            bodyParts[part] = (bodyParts[part] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Top 5 Affected Body Parts', bodyParts);

        if (yPosition > pageHeight - 80) {
            doc.addPage();
            pageNumber++;
            addPageNumber(pageNumber);
            yPosition = margin;
        }

        yPosition = addSection(yPosition + 10, 'SITE ANALYSIS');
        const siteDist = {};
        injuryData.forEach(d => {
            siteDist[d.site || 'Unknown'] = (siteDist[d.site || 'Unknown'] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Incidents by Site', siteDist);

    } else if (type === 'nearMiss') {
        yPosition = addHeader('Near Miss Report', 'Proactive Safety Management Analysis');

        yPosition = addSection(yPosition, 'EXECUTIVE SUMMARY');

        const nearMissData = state.nearMiss.filteredData;
        const criticalCount = nearMissData.filter(d =>
            d.potential_severity === 'A' || d.potential_severity === 'Critical'
        ).length;
        const avgRiskScore = (nearMissData.reduce((sum, d) =>
            sum + (parseFloat(d.risk) || 0), 0) / nearMissData.length).toFixed(2);

        const kpiY = yPosition;
        const kpiWidth = 35;
        const kpiHeight = 30;
        const kpiSpacing = 7;

        addKPICard(margin, kpiY, kpiWidth, kpiHeight, 'Total Near Misses',
                  nearMissData.length, null, colors.primary);

        addKPICard(margin + kpiWidth + kpiSpacing, kpiY, kpiWidth, kpiHeight, 'Critical Severity',
                  criticalCount, `${((criticalCount/nearMissData.length)*100).toFixed(0)}%`, colors.critical);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 2, kpiY, kpiWidth, kpiHeight, 'Avg Risk Score',
                  avgRiskScore, null, colors.high);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 3, kpiY, kpiWidth, kpiHeight, 'High Risk',
                  nearMissData.filter(d => parseFloat(d.risk) >= 7).length, null, colors.critical);

        yPosition = kpiY + kpiHeight + 15;

        yPosition = addSection(yPosition, 'HIGH RISK NEAR MISSES - TOP 3');

        const topNearMisses = selectTopIncidents(nearMissData, 'nearMiss');
        topNearMisses.forEach(incident => {
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                pageNumber++;
                addPageNumber(pageNumber);
                yPosition = margin;
            }
            yPosition = addIncidentDetail(yPosition, incident, 'nearMiss');
        });

        doc.addPage();
        pageNumber++;
        addPageNumber(pageNumber);
        yPosition = margin;

        yPosition = addSection(yPosition, 'RISK ANALYSIS');

        const potSeverityDist = {};
        nearMissData.forEach(d => {
            potSeverityDist[d.potential_severity || 'Unknown'] =
                (potSeverityDist[d.potential_severity || 'Unknown'] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Near Misses by Potential Severity', potSeverityDist);

        yPosition = addSection(yPosition + 10, 'LOCATION ANALYSIS');
        const locations = {};
        nearMissData.forEach(d => {
            const loc = d.initial_info_location_event || 'Not specified';
            locations[loc] = (locations[loc] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Top 5 Locations', locations);

        if (yPosition > pageHeight - 80) {
            doc.addPage();
            pageNumber++;
            addPageNumber(pageNumber);
            yPosition = margin;
        }

        yPosition = addSection(yPosition + 10, 'PRIMARY IMPACT ANALYSIS');
        const impacts = {};
        nearMissData.forEach(d => {
            const impact = d.initial_info_primary_impact || 'Not specified';
            impacts[impact] = (impacts[impact] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Primary Impact Types', impacts);

    } else if (type === 'combined') {
        yPosition = addHeader('Combined Safety Report', 'Comprehensive Health & Safety Analysis');

        yPosition = addSection(yPosition, 'EXECUTIVE SUMMARY');

        const injuryData = state.injury.filteredData;
        const nearMissData = state.nearMiss.filteredData;
        const totalIncidents = injuryData.length + nearMissData.length;
        const recordableCount = injuryData.filter(d => d.recordable === 1).length;
        const criticalNearMiss = nearMissData.filter(d =>
            d.potential_severity === 'A' || d.potential_severity === 'Critical'
        ).length;

        const kpiY = yPosition;
        const kpiWidth = 42;
        const kpiHeight = 30;
        const kpiSpacing = 5;

        addKPICard(margin, kpiY, kpiWidth, kpiHeight, 'Total Events',
                  totalIncidents, null, colors.primary);

        addKPICard(margin + kpiWidth + kpiSpacing, kpiY, kpiWidth, kpiHeight, 'Injuries',
                  injuryData.length, `${recordableCount} recordable`, colors.high);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 2, kpiY, kpiWidth, kpiHeight, 'Near Misses',
                  nearMissData.length, `${criticalNearMiss} critical`, colors.medium);

        addKPICard(margin + (kpiWidth + kpiSpacing) * 3, kpiY, kpiWidth, kpiHeight, 'Ratio',
                  nearMissData.length > 0 ? (injuryData.length / nearMissData.length).toFixed(2) : 'N/A',
                  'Injury:NM', colors.secondary);

        yPosition = kpiY + kpiHeight + 15;

        yPosition = addSection(yPosition, 'CRITICAL EVENTS SUMMARY');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.critical);
        doc.text('Most Severe Injuries:', margin, yPosition + 5);
        yPosition += 10;

        const topInjuries = selectTopIncidents(injuryData, 'injury').slice(0, 2);
        topInjuries.forEach(incident => {
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                pageNumber++;
                addPageNumber(pageNumber);
                yPosition = margin;
            }
            yPosition = addIncidentDetail(yPosition, incident, 'injury');
        });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.high);
        doc.text('High Risk Near Misses:', margin, yPosition + 5);
        yPosition += 10;

        const topNearMisses = selectTopIncidents(nearMissData, 'nearMiss').slice(0, 2);
        topNearMisses.forEach(incident => {
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                pageNumber++;
                addPageNumber(pageNumber);
                yPosition = margin;
            }
            yPosition = addIncidentDetail(yPosition, incident, 'nearMiss');
        });

        doc.addPage();
        pageNumber++;
        addPageNumber(pageNumber);
        yPosition = margin;

        yPosition = addSection(yPosition, 'COMPARATIVE ANALYSIS');

        const combinedSites = {};
        [...injuryData, ...nearMissData].forEach(d => {
            combinedSites[d.site || 'Unknown'] = (combinedSites[d.site || 'Unknown'] || 0) + 1;
        });
        yPosition = addChart(yPosition + 5, 'Total Events by Site', combinedSites);

        yPosition = addSection(yPosition + 10, 'RECOMMENDATIONS');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.darkGray);

        const recommendations = [
            '1. Focus on sites with highest incident rates for targeted interventions',
            '2. Analyze near miss patterns to prevent future injuries',
            '3. Implement additional controls for high-severity potential incidents',
            '4. Review and update training for most affected body parts/processes',
            '5. Establish leading indicators based on near miss data trends'
        ];

        recommendations.forEach((rec, index) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                pageNumber++;
                addPageNumber(pageNumber);
                yPosition = margin;
            }
            doc.text(rec, margin + 5, yPosition + (index * 7));
        });
    }

    doc.setFontSize(8);
    doc.setTextColor(...colors.darkGray);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Safety Analytics Platform | Confidential', pageWidth/2, pageHeight - 5, { align: 'center' });

    const fileName = `${type}_safety_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    showStatus(`PDF report "${fileName}" generated successfully`, 'success');
}

window.generatePDFReport = generatePDFReport;

