# Safety Analytics Platform v2.0

## 🛡️ Amazon WHS Austria Safety Analytics Platform

A comprehensive web application for tracking and analyzing workplace safety incidents, near misses, and safety metrics.

### 🚀 Features

- **📊 Real-time Analytics Dashboard**: Interactive charts and KPIs
- **🏥 Injury & Illness Tracking**: Comprehensive incident management
- **⚠️ Near Miss Analysis**: Risk assessment and prevention
- **📈 Combined Analytics**: Cross-module insights
- **📄 Automated Reports**: PDF and Excel export capabilities
- **✅ Action Tracking**: Follow-up and corrective actions management
- **🌙 Dark Mode**: Eye-friendly dark theme
- **📱 PWA Support**: Install as a desktop/mobile app
- **🔄 Offline Capable**: Works without internet connection

### 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/safety-analytics-platform.git
cd safety-analytics-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### 📊 Data Format

#### Injury CSV Format:
- `case_number`: Unique identifier
- `incident_date`: Date of incident (YYYY-MM-DD)
- `site`: Location/facility
- `severity`: A, B, C, or D
- `recordable`: 0 or 1
- `total_dafw_days`: Days away from work
- `otr`: yes/no (On the record)
- `initial_info_principal_body_part`: Affected body part
- `rca_primary_cause`: Root cause analysis

#### Near Miss CSV Format:
- `incident_id`: Unique identifier
- `nearmiss_date`: Date of near miss
- `site`: Location/facility
- `potential_severity`: A, B, C, or D
- `initial_info_location_event`: Where it occurred
- `initial_risk_assessment_likeliness`: Likelihood rating
- `risk`: Risk score (calculated if not provided)

### 🔑 Key Technologies

- **React 18** with TypeScript
- **Vite** for fast builds
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **Papa Parse** for CSV processing
- **jsPDF** for PDF generation
- **XLSX** for Excel export
- **PWA** support with Vite PWA

### 📈 KPI Calculations

- **TRIR**: (Recordable Cases / Hours Worked) × 200,000
- **LTIR**: (Lost Time Cases / Hours Worked) × 200,000
- **DAFWR**: (Total Days Lost / Hours Worked) × 200,000
- **NMFR**: (Near Miss Count / Hours Worked) × 200,000

### 🎨 Customization

The platform uses Amazon's brand colors by default but can be customized in `tailwind.config.js`:

```javascript
colors: {
  'amazon-orange': '#FF9900',
  'amazon-dark': '#232F3E',
  'amazon-blue': '#146EB4',
}
```

### 📱 PWA Installation

1. Visit the application in Chrome/Edge
2. Click the install button in the address bar
3. Or go to Settings → Install app

### 🐛 Troubleshooting

- **CSV not loading**: Ensure CSV headers match expected format
- **Charts not displaying**: Check browser console for errors
- **Dark mode not working**: Clear local storage and refresh

### 👥 Contributors

- **Erwin Esener** - Lead Developer
- Amazon WHS Austria Team

### 📄 License

© 2024 Amazon.com, Inc. All rights reserved.

### 📧 Support

For support or questions, contact: erwin.esener@amazon.com

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** Production Ready
