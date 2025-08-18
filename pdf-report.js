// ========== ENHANCED PDF REPORT GENERATION ==========

// PDF Report Configuration
const PDF_CONFIG = {
    margins: {
        top: 40,
        bottom: 30,
        left: 20,
        right: 20
    },
    colors: {
        primary: '#FF9900',
        secondary: '#232F3E',
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#FF5722',
        critical: '#B71C1C',
        lightGray: '#F5F5F5',
        darkGray: '#666666'
    },
    fonts: {
        title: 24,
        subtitle: 18,
        heading: 14,
        normal: 11,
        small: 9
    }
};

// Enhanced PDF Generation Function
function generatePDFReport(type) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Set document properties
    doc.setProperties({
        title: `Safety Analytics Report - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        author: 'Safety Analytics Platform',
        creator: 'Amazon WHS Austria'
    });

    // Generate report based on type
    switch(type) {
        case 'injury':
            generateInjuryPDFReport(doc);
            break;
        case 'nearMiss':
            generateNearMissPDFReport(doc);
            break;
        case 'combined':
            generateCombinedPDFReport(doc);
            break;
    }

    // Save the PDF
    const filename = `safety_report_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

// Injury Report Generation
function generateInjuryPDFReport(doc) {
    let yPos = PDF_CONFIG.margins.top;
    
    // Header
    yPos = addReportHeader(doc, 'Injury & Illness Report', yPos);
    
    // Executive Summary
    yPos = addExecutiveSummary(doc, yPos, 'injury');
    
    // KPI Dashboard
    yPos = addKPIDashboard(doc, yPos, 'injury');
    
    // Charts Section
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addChartsSection(doc, yPos, 'injury');
    
    // Detailed Incidents
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addDetailedIncidents(doc, yPos, 'injury');
    
    // Risk Analysis
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addRiskAnalysis(doc, yPos, 'injury');
    
    // Recommendations
    yPos = addRecommendations(doc, yPos, 'injury');
    
    // Footer on all pages
    addFooterToAllPages(doc);
}

// Near Miss Report Generation
function generateNearMissPDFReport(doc) {
    let yPos = PDF_CONFIG.margins.top;
    
    // Header
    yPos = addReportHeader(doc, 'Near Miss Report', yPos);
    
    // Executive Summary
    yPos = addExecutiveSummary(doc, yPos, 'nearMiss');
    
    // KPI Dashboard
    yPos = addKPIDashboard(doc, yPos, 'nearMiss');
    
    // Charts Section
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addChartsSection(doc, yPos, 'nearMiss');
    
    // Detailed Incidents
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addDetailedIncidents(doc, yPos, 'nearMiss');
    
    // Risk Matrix
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addRiskMatrix(doc, yPos, 'nearMiss');
    
    // Trending Analysis
    yPos = addTrendingAnalysis(doc, yPos, 'nearMiss');
    
    // Footer on all pages
    addFooterToAllPages(doc);
}

// Combined Report Generation
function generateCombinedPDFReport(doc) {
    let yPos = PDF_CONFIG.margins.top;
    
    // Header
    yPos = addReportHeader(doc, 'Combined Safety Report', yPos);
    
    // Executive Summary
    yPos = addExecutiveSummary(doc, yPos, 'combined');
    
    // Combined KPIs
    yPos = addCombinedKPIs(doc, yPos);
    
    // Comparative Analysis
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addComparativeAnalysis(doc, yPos);
    
    // Top Incidents from Both Categories
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addTopIncidentsCombined(doc, yPos);
    
    // Combined Risk Assessment
    doc.addPage();
    yPos = PDF_CONFIG.margins.top;
    yPos = addCombinedRiskAssessment(doc, yPos);
    
    // Action Items and Recommendations
    yPos = addActionItems(doc, yPos);
    
    // Footer on all pages
    addFooterToAllPages(doc);
}

// Helper Functions for PDF Generation

function addReportHeader(doc, title, yPos) {
    // Company Logo/Branding
    doc.setFillColor(PDF_CONFIG.colors.secondary);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(PDF_CONFIG.fonts.title);
    doc.setFont('helvetica', 'bold');
    doc.text(title, PDF_CONFIG.margins.left, 20);
    
    // Date and Site Info
    doc.setFontSize(PDF_CONFIG.fonts.normal);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Generated: ${dateStr}`, 210 - PDF_CONFIG.margins.right, 20, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    return yPos + 10;
}

function addExecutiveSummary(doc, yPos, type) {
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Executive Summary', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Summary Box
    doc.setFillColor(PDF_CONFIG.colors.lightGray);
    doc.roundedRect(PDF_CONFIG.margins.left, yPos, 170, 40, 3, 3, 'F');
    
    // Summary Content
    doc.setFontSize(PDF_CONFIG.fonts.normal);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let summaryText = '';
    if (type === 'injury') {
        const data = state.injury.filteredData;
        const recordableCount = data.filter(d => d.recordable === 1).length;
        const criticalCount = data.filter(d => d.severity === 'A').length;
        summaryText = `This report analyzes ${data.length} injury and illness cases. ` +
                     `${recordableCount} cases were recordable (${((recordableCount/data.length)*100).toFixed(1)}%). ` +
                     `${criticalCount} cases were critical severity. ` +
                     `The most affected site is ${getMostAffectedSite(data)} with ${getSiteIncidentCount(data, getMostAffectedSite(data))} incidents.`;
    } else if (type === 'nearMiss') {
        const data = state.nearMiss.filteredData;
        const highRiskCount = data.filter(d => d.risk >= 8).length;
        const criticalCount = data.filter(d => d.potential_severity === 'A').length;
        summaryText = `This report analyzes ${data.length} near miss incidents. ` +
                     `${highRiskCount} incidents were high risk (score ≥ 8). ` +
                     `${criticalCount} had critical potential severity. ` +
                     `The average risk score is ${getAverageRiskScore(data).toFixed(2)}.`;
    } else {
        const injuryData = state.injury.filteredData;
        const nearMissData = state.nearMiss.filteredData;
        summaryText = `Combined analysis of ${injuryData.length} injuries and ${nearMissData.length} near misses. ` +
                     `Total safety incidents: ${injuryData.length + nearMissData.length}. ` +
                     `The proactive reporting ratio (Near Miss:Injury) is ${(nearMissData.length/injuryData.length).toFixed(2)}:1.`;
    }
    
    const lines = doc.splitTextToSize(summaryText, 160);
    doc.text(lines, PDF_CONFIG.margins.left + 5, yPos + 8);
    
    return yPos + 50;
}

function addKPIDashboard(doc, yPos, type) {
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Key Performance Indicators', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // KPI Cards
    const kpiData = calculateKPIs(type);
    const cardWidth = 40;
    const cardHeight = 25;
    const spacing = 2;
    let xPos = PDF_CONFIG.margins.left;
    
    kpiData.forEach((kpi, index) => {
        if (index > 0 && index % 4 === 0) {
            yPos += cardHeight + spacing;
            xPos = PDF_CONFIG.margins.left;
        }
        
        // Card Background
        doc.setFillColor(getKPIColor(kpi.status));
        doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F');
        
        // KPI Value
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(PDF_CONFIG.fonts.heading);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, xPos + cardWidth/2, yPos + 10, { align: 'center' });
        
        // KPI Label
        doc.setFontSize(PDF_CONFIG.fonts.small);
        doc.setFont('helvetica', 'normal');
        doc.text(kpi.label, xPos + cardWidth/2, yPos + 18, { align: 'center' });
        
        xPos += cardWidth + spacing;
    });
    
    doc.setTextColor(0, 0, 0);
    return yPos + cardHeight + 15;
}

function addChartsSection(doc, yPos, type) {
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Data Visualization', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Create temporary canvas for charts
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 300;
    const ctx = tempCanvas.getContext('2d');
    
    // Generate and add charts
    const charts = generatePDFCharts(type, ctx);
    
    // Add charts to PDF (2x2 grid)
    const chartWidth = 85;
    const chartHeight = 60;
    
    charts.forEach((chartData, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const xPos = PDF_CONFIG.margins.left + (col * (chartWidth + 10));
        const chartYPos = yPos + (row * (chartHeight + 20));
        
        // Chart Title
        doc.setFontSize(PDF_CONFIG.fonts.normal);
        doc.setFont('helvetica', 'bold');
        doc.text(chartData.title, xPos + chartWidth/2, chartYPos, { align: 'center' });
        
        // Chart Image (placeholder - in real implementation, convert chart to image)
        doc.setFillColor(PDF_CONFIG.colors.lightGray);
        doc.rect(xPos, chartYPos + 3, chartWidth, chartHeight, 'F');
        
        // Add chart description
        doc.setFontSize(PDF_CONFIG.fonts.small);
        doc.setFont('helvetica', 'normal');
        doc.text(chartData.description, xPos + chartWidth/2, chartYPos + chartHeight + 8, { align: 'center' });
    });
    
    return yPos + 150;
}

function addDetailedIncidents(doc, yPos, type) {
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Detailed Incident Analysis', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Get top 3 incidents based on intelligent selection
    const incidents = selectTopIncidents(type, 3);
    
    incidents.forEach((incident, index) => {
        // Incident Header
        doc.setFillColor(PDF_CONFIG.colors.secondary);
        doc.rect(PDF_CONFIG.margins.left, yPos, 170, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(PDF_CONFIG.fonts.normal);
        doc.setFont('helvetica', 'bold');
        
        const headerText = type === 'injury' 
            ? `Case #${incident.case_number} - ${incident.incident_date}`
            : `Incident #${incident.incident_id} - ${incident.nearmiss_date}`;
        
        doc.text(headerText, PDF_CONFIG.margins.left + 2, yPos + 5);
        yPos += 10;
        
        // Incident Details Box
        doc.setTextColor(0, 0, 0);
        doc.setFillColor(PDF_CONFIG.colors.lightGray);
        doc.rect(PDF_CONFIG.margins.left, yPos, 170, 45, 'F');
        
        // Details Content
        doc.setFontSize(PDF_CONFIG.fonts.small);
        doc.setFont('helvetica', 'normal');
        
        let detailsY = yPos + 5;
        
        // Site and Severity
        doc.setFont('helvetica', 'bold');
        doc.text('Site:', PDF_CONFIG.margins.left + 2, detailsY);
        doc.setFont('helvetica', 'normal');
        doc.text(incident.site || 'Unknown', PDF_CONFIG.margins.left + 15, detailsY);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Severity:', PDF_CONFIG.margins.left + 60, detailsY);
        doc.setFont('helvetica', 'normal');
        const severity = type === 'injury' ? incident.severity : incident.potential_severity;
        doc.text(severity || 'Unknown', PDF_CONFIG.margins.left + 80, detailsY);
        
        // Risk Score for Near Miss
        if (type === 'nearMiss') {
            doc.setFont('helvetica', 'bold');
            doc.text('Risk Score:', PDF_CONFIG.margins.left + 110, detailsY);
            doc.setFont('helvetica', 'normal');
            doc.text((incident.risk || 0).toFixed(2), PDF_CONFIG.margins.left + 135, detailsY);
        }
        
        detailsY += 7;
        
        // Description
        doc.setFont('helvetica', 'bold');
        doc.text('Description:', PDF_CONFIG.margins.left + 2, detailsY);
        detailsY += 5;
        
        doc.setFont('helvetica', 'normal');
        const description = incident.initial_info_incident_description || 'No description available';
        const descLines = doc.splitTextToSize(description, 165);
        doc.text(descLines.slice(0, 3), PDF_CONFIG.margins.left + 2, detailsY);
        
        detailsY += (descLines.length > 3 ? 15 : descLines.length * 5);
        
        // Root Cause / Risk Assessment
        if (type === 'injury' && incident.rca_primary_cause) {
            doc.setFont('helvetica', 'bold');
            doc.text('Root Cause:', PDF_CONFIG.margins.left + 2, detailsY);
            doc.setFont('helvetica', 'normal');
            doc.text(incident.rca_primary_cause, PDF_CONFIG.margins.left + 25, detailsY);
        } else if (type === 'nearMiss') {
            doc.setFont('helvetica', 'bold');
            doc.text('Risk Category:', PDF_CONFIG.margins.left + 2, detailsY);
            doc.setFont('helvetica', 'normal');
            doc.text(incident.initial_info_risk_assessment_category || 'Not specified', PDF_CONFIG.margins.left + 30, detailsY);
        }
        
        yPos += 50;
        
        // Add spacing between incidents
        if (index < incidents.length - 1) {
            yPos += 5;
        }
        
        // Check if we need a new page
        if (yPos > 250 && index < incidents.length - 1) {
            doc.addPage();
            yPos = PDF_CONFIG.margins.top;
        }
    });
    
    return yPos + 10;
}

function addRiskAnalysis(doc, yPos, type) {
    // Check if we need a new page
    if (yPos > 200) {
        doc.addPage();
        yPos = PDF_CONFIG.margins.top;
    }
    
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Risk Analysis & Trends', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Risk Summary
    const riskData = analyzeRiskData(type);
    
    // Risk Categories Table
    doc.setFontSize(PDF_CONFIG.fonts.normal);
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Distribution by Category:', PDF_CONFIG.margins.left, yPos);
    yPos += 7;
    
    // Table Header
    doc.setFillColor(PDF_CONFIG.colors.secondary);
    doc.rect(PDF_CONFIG.margins.left, yPos, 170, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(PDF_CONFIG.fonts.small);
    doc.text('Category', PDF_CONFIG.margins.left + 2, yPos + 5);
    doc.text('Count', PDF_CONFIG.margins.left + 80, yPos + 5);
    doc.text('Percentage', PDF_CONFIG.margins.left + 120, yPos + 5);
    
    yPos += 10;
    
    // Table Rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    riskData.categories.forEach((category, index) => {
        if (index % 2 === 0) {
            doc.setFillColor(PDF_CONFIG.colors.lightGray);
            doc.rect(PDF_CONFIG.margins.left, yPos - 2, 170, 7, 'F');
        }
        
        doc.text(category.name, PDF_CONFIG.margins.left + 2, yPos + 3);
        doc.text(category.count.toString(), PDF_CONFIG.margins.left + 80, yPos + 3);
        doc.text(`${category.percentage}%`, PDF_CONFIG.margins.left + 120, yPos + 3);
        
        yPos += 7;
    });
    
    return yPos + 10;
}

function addRecommendations(doc, yPos, type) {
    // Check if we need a new page
    if (yPos > 220) {
        doc.addPage();
        yPos = PDF_CONFIG.margins.top;
    }
    
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Recommendations', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Generate recommendations based on data analysis
    const recommendations = generateRecommendations(type);
    
    doc.setFontSize(PDF_CONFIG.fonts.normal);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    recommendations.forEach((rec, index) => {
        // Recommendation number
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}.`, PDF_CONFIG.margins.left, yPos);
        
        // Recommendation text
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(rec, 160);
        doc.text(recLines, PDF_CONFIG.margins.left + 8, yPos);
        
        yPos += recLines.length * 5 + 3;
    });
    
    return yPos;
}

// Additional Helper Functions

function selectTopIncidents(type, count) {
    const data = type === 'injury' ? state.injury.filteredData : state.nearMiss.filteredData;
    
    // Intelligent selection logic
    // Priority: 1. Severity, 2. Recency, 3. Completeness of data, 4. Site diversity
    
    const scored = data.map(incident => {
        let score = 0;
        
        // Severity score (0-10)
        const severity = type === 'injury' ? incident.severity : incident.potential_severity;
        score += severity === 'A' ? 10 : severity === 'B' ? 7 : severity === 'C' ? 4 : 1;
        
        // Recency score (0-5)
        const dateField = type === 'injury' ? 'incident_date' : 'nearmiss_date';
        const daysSince = (new Date() - new Date(incident[dateField])) / (1000 * 60 * 60 * 24);
        score += daysSince < 7 ? 5 : daysSince < 30 ? 3 : daysSince < 90 ? 1 : 0;
        
        // Data completeness score (0-5)
        const hasDescription = incident.initial_info_incident_description ? 2 : 0;
        const hasRootCause = type === 'injury' && incident.rca_primary_cause ? 2 : 0;
        const hasRiskAssessment = type === 'nearMiss' && incident.initial_info_risk_assessment_category ? 2 : 0;
        score += hasDescription + hasRootCause + hasRiskAssessment;
        
        // Risk score for near misses (0-5)
        if (type === 'nearMiss' && incident.risk) {
            score += (incident.risk / 10) * 5;
        }
        
        return { ...incident, selectionScore: score };
    });
    
    // Sort by score and select top incidents
    scored.sort((a, b) => b.selectionScore - a.selectionScore);
    
    // Ensure site diversity
    const selected = [];
    const sitesIncluded = new Set();
    
    for (const incident of scored) {
        if (selected.length >= count) break;
        
        // Prioritize different sites for diversity
        if (selected.length < count / 2 || !sitesIncluded.has(incident.site)) {
            selected.push(incident);
            sitesIncluded.add(incident.site);
        }
    }
    
    // Fill remaining slots if needed
    while (selected.length < count && selected.length < scored.length) {
        const nextIncident = scored[selected.length];
        if (!selected.includes(nextIncident)) {
            selected.push(nextIncident);
        }
    }
    
    return selected;
}

function calculateKPIs(type) {
    const baselineHours = 200000; // Standard baseline
    
    if (type === 'injury') {
        const data = state.injury.filteredData;
        const recordable = data.filter(d => d.recordable === 1).length;
        const lostTime = data.filter(d => d.total_dafw_days > 0).length;
        const totalDaysLost = data.reduce((sum, d) => sum + (d.total_dafw_days || 0), 0);
        
        return [
            {
                label: 'TRIR',
                value: ((recordable / baselineHours) * 200000).toFixed(2),
                status: recordable === 0 ? 'good' : recordable < 2 ? 'warning' : 'critical'
            },
            {
                label: 'LTIR',
                value: ((lostTime / baselineHours) * 200000).toFixed(2),
                status: lostTime === 0 ? 'good' : lostTime < 2 ? 'warning' : 'critical'
            },
            {
                label: 'Total Cases',
                value: data.length.toString(),
                status: data.length < 5 ? 'good' : data.length < 10 ? 'warning' : 'critical'
            },
            {
                label: 'Days Lost',
                value: totalDaysLost.toString(),
                status: totalDaysLost === 0 ? 'good' : totalDaysLost < 30 ? 'warning' : 'critical'
            }
        ];
    } else if (type === 'nearMiss') {
        const data = state.nearMiss.filteredData;
        const highRisk = data.filter(d => d.risk >= 8).length;
        const avgRisk = data.length > 0 ? data.reduce((sum, d) => sum + (d.risk || 0), 0) / data.length : 0;
        
        return [
            {
                label: 'NMFR',
                value: ((data.length / baselineHours) * 200000).toFixed(2),
                status: data.length > 10 ? 'good' : data.length > 5 ? 'warning' : 'critical'
            },
            {
                label: 'High Risk',
                value: highRisk.toString(),
                status: highRisk === 0 ? 'good' : highRisk < 3 ? 'warning' : 'critical'
            },
            {
                label: 'Avg Risk',
                value: avgRisk.toFixed(2),
                status: avgRisk < 5 ? 'good' : avgRisk < 7 ? 'warning' : 'critical'
            },
            {
                label: 'Total NM',
                value: data.length.toString(),
                status: data.length > 20 ? 'good' : data.length > 10 ? 'warning' : 'critical'
            }
        ];
    }
    
    return [];
}

function getKPIColor(status) {
    switch(status) {
        case 'good': return PDF_CONFIG.colors.success;
        case 'warning': return PDF_CONFIG.colors.warning;
        case 'critical': return PDF_CONFIG.colors.danger;
        default: return PDF_CONFIG.colors.secondary;
    }
}

function generateRecommendations(type) {
    const recommendations = [];
    
    if (type === 'injury') {
        const data = state.injury.filteredData;
        const severityA = data.filter(d => d.severity === 'A').length;
        const recordable = data.filter(d => d.recordable === 1).length;
        
        if (severityA > 0) {
            recommendations.push(`Immediate action required: ${severityA} critical severity incidents detected. Conduct comprehensive safety review and implement enhanced controls.`);
        }
        
        if (recordable > 5) {
            recommendations.push(`High recordable rate detected (${recordable} cases). Review and strengthen preventive measures, particularly in PPE compliance and training.`);
        }
        
        // Add site-specific recommendation
        const topSite = getMostAffectedSite(data);
        recommendations.push(`Focus safety improvements at ${topSite} site, which accounts for the highest incident rate.`);
        
        // Add body part specific recommendation
        const topBodyPart = getMostAffectedBodyPart(data);
        if (topBodyPart) {
            recommendations.push(`Implement targeted ergonomic improvements for ${topBodyPart} injuries, which represent the most common injury type.`);
        }
    } else if (type === 'nearMiss') {
        const data = state.nearMiss.filteredData;
        const highRisk = data.filter(d => d.risk >= 8).length;
        
        if (highRisk > 3) {
            recommendations.push(`${highRisk} high-risk near misses identified. Prioritize corrective actions for these incidents to prevent potential injuries.`);
        }
        
        recommendations.push(`Maintain positive near-miss reporting culture. Current reporting rate indicates good hazard awareness among associates.`);
        
        // Add risk category recommendation
        const topRiskCategory = getTopRiskCategory(data);
        if (topRiskCategory) {
            recommendations.push(`Focus risk mitigation efforts on ${topRiskCategory} category, which shows the highest frequency of near-miss events.`);
        }
    }
    
    // General recommendations
    recommendations.push(`Conduct monthly safety walks focusing on identified high-risk areas and processes.`);
    recommendations.push(`Enhance safety training programs with emphasis on hazard recognition and reporting.`);
    
    return recommendations;
}

function addFooterToAllPages(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(PDF_CONFIG.colors.secondary);
        doc.line(PDF_CONFIG.margins.left, 280, 210 - PDF_CONFIG.margins.right, 280);
        
        // Footer text
        doc.setFontSize(PDF_CONFIG.fonts.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(PDF_CONFIG.colors.darkGray);
        
        // Page number
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        
        // Confidentiality notice
        doc.text('Confidential - Amazon Internal Use Only', PDF_CONFIG.margins.left, 285);
        
        // Generated by
        doc.text('Safety Analytics Platform v2.0', 210 - PDF_CONFIG.margins.right, 285, { align: 'right' });
    }
}

// Additional utility functions for PDF generation

function getMostAffectedSite(data) {
    const siteCounts = {};
    data.forEach(d => {
        siteCounts[d.site] = (siteCounts[d.site] || 0) + 1;
    });
    
    let maxSite = 'Unknown';
    let maxCount = 0;
    
    for (const [site, count] of Object.entries(siteCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxSite = site;
        }
    }
    
    return maxSite;
}

function getSiteIncidentCount(data, site) {
    return data.filter(d => d.site === site).length;
}

function getAverageRiskScore(data) {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + (d.risk || 0), 0) / data.length;
}

function getMostAffectedBodyPart(data) {
    const bodyParts = {};
    data.forEach(d => {
        if (d.initial_info_principal_body_part) {
            bodyParts[d.initial_info_principal_body_part] = (bodyParts[d.initial_info_principal_body_part] || 0) + 1;
        }
    });
    
    let maxPart = null;
    let maxCount = 0;
    
    for (const [part, count] of Object.entries(bodyParts)) {
        if (count > maxCount) {
            maxCount = count;
            maxPart = part;
        }
    }
    
    return maxPart;
}

function getTopRiskCategory(data) {
    const categories = {};
    data.forEach(d => {
        if (d.initial_info_risk_assessment_category) {
            categories[d.initial_info_risk_assessment_category] = (categories[d.initial_info_risk_assessment_category] || 0) + 1;
        }
    });
    
    let maxCategory = null;
    let maxCount = 0;
    
    for (const [category, count] of Object.entries(categories)) {
        if (count > maxCount) {
            maxCount = count;
            maxCategory = category;
        }
    }
    
    return maxCategory;
}

function analyzeRiskData(type) {
    const data = type === 'injury' ? state.injury.filteredData : state.nearMiss.filteredData;
    const total = data.length;
    
    const categories = [];
    const categoryMap = {};
    
    // Analyze by severity
    const severityField = type === 'injury' ? 'severity' : 'potential_severity';
    data.forEach(d => {
        const severity = d[severityField] || 'Unknown';
        categoryMap[severity] = (categoryMap[severity] || 0) + 1;
    });
    
    for (const [category, count] of Object.entries(categoryMap)) {
        categories.push({
            name: `Severity ${category}`,
            count: count,
            percentage: ((count / total) * 100).toFixed(1)
        });
    }
    
    // Sort by count
    categories.sort((a, b) => b.count - a.count);
    
    return { categories };
}

// Combined report specific functions

function addCombinedKPIs(doc, yPos) {
    // Implementation for combined KPIs
    // Similar structure to addKPIDashboard but with combined metrics
    const injuryData = state.injury.filteredData;
    const nearMissData = state.nearMiss.filteredData;
    
    // Calculate combined metrics
    const totalIncidents = injuryData.length + nearMissData.length;
    const proactiveRatio = injuryData.length > 0 ? (nearMissData.length / injuryData.length).toFixed(2) : 'N/A';
    
    // Add KPI cards
    // ... (similar implementation to addKPIDashboard)
    
    return yPos + 40;
}

function addComparativeAnalysis(doc, yPos) {
    // Section Title
    doc.setFontSize(PDF_CONFIG.fonts.subtitle);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text('Comparative Analysis: Injuries vs Near Misses', PDF_CONFIG.margins.left, yPos);
    yPos += 10;
    
    // Add comparative charts and analysis
    // ... (implementation details)
    
    return yPos + 100;
}

function addTopIncidentsCombined(doc, yPos) {
    // Get top 3 injuries and top 3 near misses
    const topInjuries = selectTopIncidents('injury', 3);
    const topNearMisses = selectTopIncidents('nearMiss', 3);
    
    // Display in two columns
    // ... (implementation details)
    
    return yPos + 150;
}

function addCombinedRiskAssessment(doc, yPos) {
    // Combined risk matrix and assessment
    // ... (implementation details)
    
    return yPos + 80;
}

function addActionItems(doc, yPos) {
    // Priority action items based on combined analysis
    // ... (implementation details)
    
    return yPos + 60;
}

function addRiskMatrix(doc, yPos, type) {
    // Risk matrix visualization for near miss report
    // ... (implementation details)
    
    return yPos + 80;
}

function addTrendingAnalysis(doc, yPos, type) {
    // Trending analysis section
    // ... (implementation details)
    
    return yPos + 60;
}

function generatePDFCharts(type, ctx) {
    // Generate chart data for PDF
    // This would create actual Chart.js charts and convert them to images
    // For now, returning placeholder data
    
    const charts = [];
    
    if (type === 'injury') {
        charts.push({
            title: 'Severity Distribution',
            description: 'Breakdown by severity level'
        });
        charts.push({
            title: 'Site Comparison',
            description: 'Incidents per location'
        });
        charts.push({
            title: 'Body Parts Affected',
            description: 'Most common injury areas'
        });
        charts.push({
            title: 'Monthly Trend',
            description: 'Incident frequency over time'
        });
    } else if (type === 'nearMiss') {
        charts.push({
            title: 'Risk Score Distribution',
            description: 'Near misses by risk level'
        });
        charts.push({
            title: 'Potential Severity',
            description: 'What could have happened'
        });
        charts.push({
            title: 'Location Analysis',
            description: 'Where near misses occur'
        });
        charts.push({
            title: 'Risk Categories',
            description: 'Types of hazards identified'
        });
    }
    
    return charts;
}

// PDF Export Menu Toggle
function togglePDFMenu() {
    const dropdown = document.getElementById('pdfExportDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.pdf-export-menu');
    const dropdown = document.getElementById('pdfExportDropdown');
    
    if (!menu || !dropdown) return;
    if (!menu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Expose functions globally
window.generatePDFReport = generatePDFReport;
window.togglePDFMenu = togglePDFMenu;

