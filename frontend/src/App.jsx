import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CrowdSimulatorBar from './components/CrowdSimulatorBar';
import WhatIfModal from './components/WhatIfModal';
import ToastContainer from './components/ToastContainer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import GenerateTokenPage from './pages/GenerateTokenPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import CounterManagementPage from './pages/CounterManagementPage';
import AIPredictionDashboard from './pages/AIPredictionDashboard';
import AnalyticsReportsPage from './pages/AnalyticsReportsPage';
import AlertsNotificationsPage from './pages/AlertsNotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Layout wrapper for Admin pages with sidebar
const AdminLayout = ({ children, onOpenSimulator, onOpenWhatIf }) => {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar onOpenSimulator={onOpenSimulator} onOpenWhatIf={onOpenWhatIf} />
      </div>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// Layout wrapper for User portal pages
const UserLayout = ({ children }) => {
  return (
    <main className="flex-1 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {children}
    </main>
  );
};

function AppContent() {
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenWhatIf={() => setWhatIfOpen(true)}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <LandingPage
              onOpenSimulator={() => setSimulatorOpen(true)}
              onOpenWhatIf={() => setWhatIfOpen(true)}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track/:tokenId" element={<UserLayout><LiveTrackingPage /></UserLayout>} />
        <Route path="/user/tracking" element={<UserLayout><LiveTrackingPage /></UserLayout>} />

        {/* User Portal Routes */}
        <Route path="/user/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
        <Route path="/user/generate-token" element={<UserLayout><GenerateTokenPage /></UserLayout>} />

        {/* Admin Console Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/counters"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <CounterManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/ai-predictions"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <AIPredictionDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <AnalyticsReportsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <AlertsNotificationsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout onOpenSimulator={() => setSimulatorOpen(true)} onOpenWhatIf={() => setWhatIfOpen(true)}>
              <SettingsPage />
            </AdminLayout>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Interactive Simulators */}
      <CrowdSimulatorBar
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <WhatIfModal
        isOpen={whatIfOpen}
        onClose={() => setWhatIfOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <QueueProvider>
          <AppContent />
        </QueueProvider>
      </AuthProvider>
    </Router>
  );
}
