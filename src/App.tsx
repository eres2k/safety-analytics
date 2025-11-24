/**
 * Main App Component
 * Modern Safety Analytics Platform
 */

import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './modules/Overview';
import { DataUpload } from './modules/DataUpload';
import { useAppStore } from './store';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
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

export const App: React.FC = () => {
  const currentModule = useAppStore(state => state.currentModule);
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);

  // Initialize theme
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Render appropriate module
  const renderModule = () => {
    switch (currentModule) {
      case 'overview':
        return <Overview />;

      case 'injury':
      case 'nearMiss':
      case 'combined':
      case 'inspections':
      case 'reports':
      case 'actions':
        return <DataUpload />;

      default:
        return <Overview />;
    }
  };

  return (
    <Layout>
      {renderModule()}
    </Layout>
  );
};
