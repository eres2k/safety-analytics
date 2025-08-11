#!/bin/bash

# Safety Analytics Platform - Final Setup
echo "🚀 Completing Safety Analytics Platform Setup..."

# 13. Update App.tsx
cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SafetyProvider } from './contexts/SafetyContext';
import Layout from './components/Layout/Layout';
import Overview from './components/Dashboard/Overview';
import InjuryDashboard from './components/InjuryModule/InjuryDashboard';
import NearMissDashboard from './components/NearMissModule/NearMissDashboard';
import CombinedAnalytics from './components/CombinedAnalytics/CombinedAnalytics';
import ReportGenerator from './components/Reports/ReportGenerator';
import ActionTracking from './components/Actions/ActionTracking';
import './index.css';

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function App() {
  return (
    <SafetyProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/injury" element={<InjuryDashboard />} />
            <Route path="/nearmiss" element={<NearMissDashboard />} />
            <Route path="/combined" element={<CombinedAnalytics />} />
            <Route path="/reports" element={<ReportGenerator />} />
            <Route path="/actions" element={<ActionTracking />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF5722',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </SafetyProvider>
  );
}

export default App;
EOF

# 14. Update main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply theme on initial load
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# 15. Update styles - Complete Tailwind CSS configuration
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #FF9900;
    --color-secondary: #232F3E;
    --color-success: #4CAF50;
    --color-warning: #FFC107;
    --color-danger: #FF5722;
    --color-info: #2196F3;
  }

  [data-theme='dark'] {
    color-scheme: dark;
  }

  body {
    @apply transition-colors duration-200;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors;
  }

  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-lg;
  }

  .input {
    @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500;
  }

  .table-header {
    @apply px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
  }

  .badge {
    @apply px-2 py-1 text-xs rounded-full font-medium;
  }

  .badge-severity-a {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
  }

  .badge-severity-b {
    @apply bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200;
  }

  .badge-severity-c {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
  }

  .badge-severity-d {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: theme('colors.gray.400') transparent;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: theme('colors.gray.400');
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
}

/* Custom scrollbar for dark mode */
[data-theme='dark'] .scrollbar-thin {
  scrollbar-color: theme('colors.gray.600') transparent;
}

[data-theme='dark'] .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: theme('colors.gray.600');
}

/* Chart.js custom styles */
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Loading spinner */
.spinner {
  border: 3px solid theme('colors.gray.200');
  border-top: 3px solid theme('colors.orange.500');
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
    color: black;
  }
}
EOF

# 16. Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'amazon-orange': '#FF9900',
        'amazon-dark': '#232F3E',
        'amazon-blue': '#146EB4',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
EOF

# 17. Create PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 18. Create Vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'robots.txt'],
      manifest: {
        name: 'Safety Analytics Platform',
        short_name: 'Safety Analytics',
        description: 'Amazon WHS Austria Safety Analytics Platform',
        theme_color: '#FF9900',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils-vendor': ['date-fns', 'papaparse', 'jspdf', 'xlsx']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
EOF

# 19. Create public assets
cat > public/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#FF9900" rx="20"/>
  <path d="M50 20 L70 40 L70 60 L50 80 L30 60 L30 40 Z" fill="white"/>
  <text x="50" y="55" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#FF9900">S</text>
</svg>
EOF

cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
EOF

# 20. Create ESLint configuration
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
EOF

# 21. Create environment file
cat > .env.example << 'EOF'
# API Configuration (for future backend integration)
VITE_API_URL=http://localhost:4000/api
VITE_API_KEY=your-api-key-here

# Analytics (optional)
VITE_GA_TRACKING_ID=

# Feature Flags
VITE_ENABLE_EXPORT=true
VITE_ENABLE_PWA=true
EOF

# 22. Create README
cat > README.md << 'EOF'
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
EOF

# 23. Create sample data generator
cat > scripts/generateSampleData.js << 'EOF'
// Sample Data Generator for Testing
import { writeFileSync } from 'fs';

const sites = ['VIE1', 'VIE2', 'VIE3', 'VIE4'];
const bodyParts = ['Hand', 'Back', 'Shoulder', 'Knee', 'Foot', 'Head', 'Arm', 'Leg'];
const severities = ['A', 'B', 'C', 'D'];
const rootCauses = [
  'Manual Handling',
  'Slip/Trip/Fall',
  'Struck By Object',
  'Equipment Malfunction',
  'Repetitive Motion',
  'Poor Ergonomics'
];

// Generate Injury Data
const injuryData = [];
for (let i = 1; i <= 100; i++) {
  const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  injuryData.push({
    case_number: `INJ-2024-${String(i).padStart(4, '0')}`,
    incident_date: date.toISOString().split('T')[0],
    site: sites[Math.floor(Math.random() * sites.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    recordable: Math.random() > 0.5 ? 1 : 0,
    total_dafw_days: Math.floor(Math.random() * 30),
    otr: Math.random() > 0.7 ? 'yes' : 'no',
    initial_info_principal_body_part: bodyParts[Math.floor(Math.random() * bodyParts.length)],
    rca_primary_cause: rootCauses[Math.floor(Math.random() * rootCauses.length)]
  });
}

// Generate Near Miss Data
const nearMissData = [];
const likelihoods = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const locations = ['Warehouse', 'Loading Dock', 'Office', 'Parking Lot', 'Break Room'];

for (let i = 1; i <= 150; i++) {
  const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  nearMissData.push({
    incident_id: `NM-2024-${String(i).padStart(4, '0')}`,
    nearmiss_date: date.toISOString().split('T')[0],
    site: sites[Math.floor(Math.random() * sites.length)],
    potential_severity: severities[Math.floor(Math.random() * severities.length)],
    initial_info_location_event: locations[Math.floor(Math.random() * locations.length)],
    initial_risk_assessment_likeliness: likelihoods[Math.floor(Math.random() * likelihoods.length)]
  });
}

// Convert to CSV
const injuryCSV = [
  Object.keys(injuryData[0]).join(','),
  ...injuryData.map(row => Object.values(row).join(','))
].join('\n');

const nearMissCSV = [
  Object.keys(nearMissData[0]).join(','),
  ...nearMissData.map(row => Object.values(row).join(','))
].join('\n');

// Save files
writeFileSync('sample_injury_data.csv', injuryCSV);
writeFileSync('sample_nearmiss_data.csv', nearMissCSV);

console.log('✅ Sample data generated successfully!');
console.log('📄 Files created: sample_injury_data.csv, sample_nearmiss_data.csv');
EOF

# 24. Create deployment script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Building Safety Analytics Platform for production..."

# Build the application
npm run build

echo "✅ Build complete!"
echo "📁 Production files in ./dist"
echo ""
echo "To deploy to Netlify:"
echo "1. Push to GitHub"
echo "2. Connect repository to Netlify"
echo "3. Set build command: npm run build"
echo "4. Set publish directory: dist"
echo ""
echo "Or deploy manually:"
echo "netlify deploy --prod --dir=dist"
EOF

chmod +x scripts/deploy.sh

# 25. Final message
cat << 'EOF'

✅ ========================================
   SAFETY ANALYTICS PLATFORM SETUP COMPLETE!
   ========================================

📋 Next Steps:

1. Install dependencies:
   npm install

2. Start development server:
   npm run dev

3. Access the application:
   http://localhost:3000

4. Generate sample data (optional):
   node scripts/generateSampleData.js

5. Build for production:
   npm run build

📁 Project Structure:
   src/
   ├── components/     # React components
   ├── contexts/       # Context providers
   ├── utils/          # Utility functions
   ├── types/          # TypeScript types
   └── App.tsx         # Main app component

🔧 Configuration Files:
   - vite.config.ts    # Vite configuration
   - tailwind.config.js # Tailwind CSS
   - tsconfig.json     # TypeScript
   - package.json      # Dependencies

📊 Features Implemented:
   ✅ Injury & Illness Module
   ✅ Near Miss Module
   ✅ Combined Analytics
   ✅ Report Generation (PDF/Excel)
   ✅ Action Tracking
   ✅ Dark Mode
   ✅ PWA Support
   ✅ Responsive Design
   ✅ Data Filtering
   ✅ CSV Import/Export

🚀 Ready for deployment to Netlify!

Developer: Erwin Esener
Organization: Amazon WHS Austria
Version: 2.0.0

========================================
EOF