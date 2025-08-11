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
