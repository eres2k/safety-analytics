#!/bin/bash

# Safety Analytics Platform - Complete Setup Script
# Author: Erwin Esener
# This script creates the entire React application structure with all files

set -e  # Exit on error

echo "🚀 Safety Analytics Platform - React Setup Script"
echo "================================================="
echo ""

# Check if directory name was provided
PROJECT_NAME=${1:-safety-analytics}

echo "📁 Creating project: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "safety-analytics-platform",
  "version": "2.0.0",
  "author": "Erwin Esener",
  "description": "Amazon WHS Austria Safety Analytics Platform",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "papaparse": "^5.4.1",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.7.0",
    "xlsx": "^0.18.5",
    "html2canvas": "^1.4.1",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "react-hot-toast": "^2.4.1",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/papaparse": "^5.3.14",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vite-plugin-pwa": "^0.17.4",
    "vitest": "^1.0.4",
    "workbox-window": "^7.0.0"
  }
}
EOF

# Create vite.config.ts
echo "⚙️ Creating vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Safety Analytics Platform',
        short_name: 'SafetyAnalytics',
        description: 'Amazon WHS Austria Safety Analytics Platform',
        theme_color: '#FF9900',
        background_color: '#232F3E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
EOF

# Create tsconfig.json
echo "📝 Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Create tailwind.config.js
echo "🎨 Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: '#FF9900',
          dark: '#232F3E',
          gray: '#37475A',
          light: '#F5F5F5'
        },
        severity: {
          A: '#B71C1C',
          B: '#FF5722',
          C: '#FFC107',
          D: '#4CAF50'
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateY(-10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }
    }
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF

# Create index.html
echo "📄 Creating index.html..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Amazon WHS Austria Safety Analytics Platform" />
    <meta name="author" content="Erwin Esener" />
    <title>Safety Analytics Platform - Amazon WHS Austria</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p public
mkdir -p src/{components/{Layout,Dashboard,InjuryModule,NearMissModule,CombinedAnalytics,Reports,Actions,Common},contexts,hooks,services,types,utils}

# Create src/main.tsx
echo "📝 Creating src/main.tsx..."
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SafetyProvider } from './contexts/SafetyContext';
import { Toaster } from 'react-hot-toast';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SafetyProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </SafetyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
EOF

# Create src/App.tsx
echo "📝 Creating src/App.tsx..."
cat > src/App.tsx << 'EOF'
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

const Overview = lazy(() => import('./components/Dashboard/Overview'));
const InjuryDashboard = lazy(() => import('./components/InjuryModule/InjuryDashboard'));
const NearMissDashboard = lazy(() => import('./components/NearMissModule/NearMissDashboard'));
const CombinedAnalytics = lazy(() => import('./components/CombinedAnalytics/CombinedAnalytics'));
const Reports = lazy(() => import('./components/Reports/ReportGenerator'));
const ActionTracking = lazy(() => import('./components/Actions/ActionTracking'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/injury" element={<InjuryDashboard />} />
          <Route path="/nearmiss" element={<NearMissDashboard />} />
          <Route path="/combined" element={<CombinedAnalytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/actions" element={<ActionTracking />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
EOF

# Create src/index.css
echo "🎨 Creating src/index.css..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --amazon-orange: #FF9900;
  --amazon-dark: #232F3E;
  --amazon-gray: #37475A;
}

/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
.dark .scrollbar-thin::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4a5568;
}

/* Chart container */
.chart-container {
  position: relative;
  height: 16rem;
  width: 100%;
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
EOF

# Create src/types/index.ts
echo "📝 Creating type definitions..."
cat > src/types/index.ts << 'EOF'
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
EOF

# Create SafetyContext
echo "📝 Creating SafetyContext..."
cat > src/contexts/SafetyContext.tsx << 'EOF'
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SafetyState, InjuryRecord, NearMissRecord, Module } from '../types';

interface SafetyContextType {
  state: SafetyState;
  dispatch: React.Dispatch<SafetyAction>;
}

type SafetyAction =
  | { type: 'SET_INJURY_DATA'; payload: InjuryRecord[] }
  | { type: 'SET_NEAR_MISS_DATA'; payload: NearMissRecord[] }
  | { type: 'APPLY_INJURY_FILTERS'; payload: InjuryRecord[] }
  | { type: 'APPLY_NEAR_MISS_FILTERS'; payload: NearMissRecord[] }
  | { type: 'SET_MODULE'; payload: Module }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_PAGE'; payload: { module: 'injury' | 'nearMiss'; page: number } }
  | { type: 'SET_TIMELINE_PAGE'; payload: { module: 'injury' | 'nearMiss'; page: number } };

const initialState: SafetyState = {
  injury: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  nearMiss: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  currentModule: 'overview',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  itemsPerPage: 15
};

function safetyReducer(state: SafetyState, action: SafetyAction): SafetyState {
  switch (action.type) {
    case 'SET_INJURY_DATA':
      return {
        ...state,
        injury: {
          ...state.injury,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    case 'SET_NEAR_MISS_DATA':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    case 'APPLY_INJURY_FILTERS':
      return {
        ...state,
        injury: {
          ...state.injury,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    case 'APPLY_NEAR_MISS_FILTERS':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload
      };
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark');
      return {
        ...state,
        theme: newTheme
      };
    case 'SET_PAGE':
      return {
        ...state,
        [action.payload.module]: {
          ...state[action.payload.module],
          currentPage: action.payload.page
        }
      };
    case 'SET_TIMELINE_PAGE':
      return {
        ...state,
        [action.payload.module]: {
          ...state[action.payload.module],
          timelinePage: action.payload.page
        }
      };
    default:
      return state;
  }
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(safetyReducer, initialState);

  return (
    <SafetyContext.Provider value={{ state, dispatch }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
EOF

# Create Layout components
echo "📝 Creating Layout components..."

cat > src/components/Layout/Layout.tsx << 'EOF'
import React from 'react';
import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
EOF

cat > src/components/Layout/Header.tsx << 'EOF'
import React from 'react';
import { useSafety } from '../../contexts/SafetyContext';

export default function Header() {
  const { state, dispatch } = useSafety();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <header className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🛡️</span>
              Safety Analytics Platform
            </h1>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <span>Amazon WHS Austria</span>
              <span className="opacity-70">|</span>
              <span>Developed by Erwin Esener</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            {state.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
}
EOF

cat > src/components/Layout/Navigation.tsx << 'EOF'
import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { path: '/overview', label: 'Overview', icon: '📊' },
  { path: '/injury', label: 'Injury & Illness', icon: '🏥' },
  { path: '/nearmiss', label: 'Near Miss', icon: '⚠️' },
  { path: '/combined', label: 'Combined Analytics', icon: '📈' },
  { path: '/reports', label: 'Reports', icon: '📄' },
  { path: '/actions', label: 'Action Tracking', icon: '✅' },
];

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-[88px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all',
                  'hover:translate-y-[-2px] hover:shadow-lg',
                  isActive
                    ? 'bg-amazon-orange text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                )
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
EOF

cat > src/components/Layout/Footer.tsx << 'EOF'
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-amazon-dark text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <p>
          Safety Analytics Platform v2.0 | Amazon WHS Austria | 
          Developed by <a href="mailto:erwin.esener@amazon.com" className="text-amazon-orange hover:underline"> Erwin Esener</a> | 
          © 2024 Amazon.com, Inc.
        </p>
      </div>
    </footer>
  );
}
EOF

# Create Common components
echo "📝 Creating Common components..."

cat > src/components/Common/LoadingSpinner.tsx << 'EOF'
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-amazon-orange rounded-full"></div>
    </div>
  );
}
EOF

cat > src/components/Common/FileUpload.tsx << 'EOF'
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
  type: 'injury' | 'nearmiss';
}

export default function FileUpload({ onDataLoaded, type }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded(results.data);
        toast.success(`Loaded ${results.data.length} ${type} records successfully!`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center transition-all',
        isDragging
          ? 'border-amazon-orange bg-amazon-orange/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-amazon-orange'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        📁 Drag and drop your {type} CSV file here
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors font-medium"
      >
        Choose File
      </button>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {type === 'injury'
          ? 'Supports CSV files with injury/illness tracking data'
          : 'Supports CSV files with near miss tracking data'}
      </p>
    </div>
  );
}
EOF

# Create Dashboard components
echo "📝 Creating Dashboard components..."

cat > src/components/Dashboard/Overview.tsx << 'EOF'
import React, { useMemo } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import toast from 'react-hot-toast';

export default function Overview() {
  const { state } = useSafety();
  const hasData = state.injury.rawData.length > 0 || state.nearMiss.rawData.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amazon-orange to-amazon-dark bg-clip-text text-transparent">
          Welcome to Safety Analytics
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your comprehensive platform for workplace safety data analysis
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.href = '/injury'}
            className="px-6 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
          >
            <span className="mr-2">🏥</span> Analyze Injuries
          </button>
          <button
            onClick={() => window.location.href = '/nearmiss'}
            className="px-6 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
          >
            <span className="mr-2">⚠️</span> Review Near Misses
          </button>
          <button
            onClick={() => toast.success('Sample data would be loaded here')}
            className="px-6 py-3 bg-amazon-dark text-white rounded-lg hover:bg-amazon-gray transition-colors"
          >
            <span className="mr-2">🧪</span> Load Sample Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">TRIR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">LTIR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">DAFWR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0.00</div>
            <div className="text-sm opacity-90">NMFR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Injury Module placeholder
cat > src/components/InjuryModule/InjuryDashboard.tsx << 'EOF'
import React from 'react';
import FileUpload from '../Common/FileUpload';
import { useSafety } from '../../contexts/SafetyContext';
import toast from 'react-hot-toast';

export default function InjuryDashboard() {
  const { state, dispatch } = useSafety();

  const handleDataLoad = (data: any[]) => {
    // Process and set injury data
    dispatch({ type: 'SET_INJURY_DATA', payload: data });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Injury & Illness Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => toast.success('PDF report would be generated')}
              className="px-4 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
            >
              📄 Generate Report
            </button>
          </div>
        </div>

        {state.injury.rawData.length === 0 && (
          <FileUpload onDataLoaded={handleDataLoad} type="injury" />
        )}

        {state.injury.rawData.length > 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Injury data loaded: {state.injury.rawData.length} records</p>
            <p className="mt-2">Full dashboard implementation coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# Create Near Miss Module placeholder
cat > src/components/NearMissModule/NearMissDashboard.tsx << 'EOF'
import React from 'react';
import FileUpload from '../Common/FileUpload';
import { useSafety } from '../../contexts/SafetyContext';
import toast from 'react-hot-toast';

export default function NearMissDashboard() {
  const { state, dispatch } = useSafety();

  const handleDataLoad = (data: any[]) => {
    dispatch({ type: 'SET_NEAR_MISS_DATA', payload: data });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Near Miss Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => toast.success('PDF report would be generated')}
              className="px-4 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors"
            >
              📄 Generate Report
            </button>
          </div>
        </div>

        {state.nearMiss.rawData.length === 0 && (
          <FileUpload onDataLoaded={handleDataLoad} type="nearmiss" />
        )}

        {state.nearMiss.rawData.length > 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Near miss data loaded: {state.nearMiss.rawData.length} records</p>
            <p className="mt-2">Full dashboard implementation coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# Create placeholder components for other modules
cat > src/components/CombinedAnalytics/CombinedAnalytics.tsx << 'EOF'
import React from 'react';

export default function CombinedAnalytics() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Combined Analytics</h2>
      <p>Combined safety analytics module - implementation in progress</p>
    </div>
  );
}
EOF

cat > src/components/Reports/ReportGenerator.tsx << 'EOF'
import React from 'react';

export default function ReportGenerator() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Report Generation Center</h2>
      <p>Report generation module - implementation in progress</p>
    </div>
  );
}
EOF

cat > src/components/Actions/ActionTracking.tsx << 'EOF'
import React from 'react';

export default function ActionTracking() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Action Item Tracking</h2>
      <p>Action tracking module - implementation in progress</p>
    </div>
  );
}
EOF

# Create utility functions
echo "📝 Creating utility functions..."

cat > src/utils/calculations.ts << 'EOF'
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
EOF

cat > src/utils/constants.ts << 'EOF'
export const DEFAULT_AUSTIN_URL = 'https://safety.amazon.com/austin-case-study';

export const SEVERITY_COLORS = {
  'A': '#B71C1C',
  'B': '#FF5722',
  'C': '#FFC107',
  'D': '#4CAF50',
  'Unknown': '#9E9E9E'
};
EOF

cat > src/services/dataProcessor.ts << 'EOF'
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
EOF

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Safety Analytics Platform setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run the development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Start developing!"
echo ""
echo "🚀 Additional commands:"
echo "   npm run build    - Build for production"
echo "   npm run preview  - Preview production build"
echo "   npm run test     - Run tests"
echo ""
echo "📚 Documentation:"
echo "   The application is now set up with:"
echo "   - React 18 with TypeScript"
echo "   - Vite for fast development"
echo "   - Tailwind CSS for styling"
echo "   - PWA support for offline usage"
echo "   - React Router for navigation"
echo "   - Chart.js for visualizations"
echo ""
echo "👨‍💻 Developed by Erwin Esener - Amazon WHS Austria"
EOF