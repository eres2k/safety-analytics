import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import InstallPrompt from './components/Common/InstallPrompt';
import { usePWA } from './contexts/PWAContext';

const Overview = lazy(() => import('./components/Dashboard/Overview'));
const InjuryDashboard = lazy(() => import('./components/InjuryModule/InjuryDashboard'));
const NearMissDashboard = lazy(() => import('./components/NearMissModule/NearMissDashboard'));
const CombinedAnalytics = lazy(() => import('./components/CombinedAnalytics/CombinedAnalytics'));
const Reports = lazy(() => import('./components/Reports/ReportGenerator'));
const ActionTracking = lazy(() => import('./components/Actions/ActionTracking'));

function App() {
  const { isInstalled } = usePWA();

  useEffect(() => {
    // Log installation status
    if (isInstalled) {
      console.log('✅ App is installed as PWA');
    }
  }, [isInstalled]);

  return (
    <>
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
      <InstallPrompt />
    </>
  );
}

export default App;
