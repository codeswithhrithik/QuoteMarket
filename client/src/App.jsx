/**
 * ============================================================================
 * QuoteCraft - Main Application Routing
 * ============================================================================
 * Configures client routes, layout wrapper with Navbar, and protected route guards.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import QuotesList from './pages/QuotesList';
import QuoteEditor from './pages/QuoteEditor';
import Parties from './pages/Parties';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import PublicQuote from './pages/PublicQuote';
import AdminDashboard from './pages/AdminDashboard';
import ScannerPromptModal from './components/subscription/ScannerPromptModal';

import { Lock, QrCode } from 'lucide-react';

/**
 * Route guard for authenticated owners
 */
function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading, scannerOpen, scannerInitialPlan, openScannerModal, closeScannerModal } = useAuth();
  const [modalDismissed, setModalDismissed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));

  const showModal = scannerOpen || (isPlanDue && !modalDismissed);

  const handleCloseModal = () => {
    setModalDismissed(true);
    closeScannerModal();
  };

  const handleOpenScanner = (planId = '3m') => {
    setModalDismissed(false);
    openScannerModal(planId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenScanner={handleOpenScanner} />

      {/* Persistent warning banner when subscription plan is expired */}
      {isPlanDue && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-rose-200 shrink-0" />
            <span>
              <strong>Subscription Expired</strong>: Profile settings and new quote creation are locked. You can view & download previous quotes.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenScanner('3m')}
            className="px-3.5 py-1 bg-white hover:bg-rose-50 text-rose-900 rounded-lg font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-rose-700" />
            <span>Scan & Pay Now</span>
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>

      {/* Subscription Scanner Prompt Modal */}
      <ScannerPromptModal
        isOpen={showModal}
        onClose={handleCloseModal}
        initialPlanId={scannerInitialPlan}
      />
    </div>
  );
}

/**
 * Route guard for Super Admin only (hrithikyadav05@gmail.com / Ming@321#!)
 */
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Client Share View (No login required) */}
            <Route path="/view-quote/:token" element={<PublicQuote />} />

            {/* Public Auth Page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Owner Pages */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes"
              element={
                <ProtectedRoute>
                  <QuotesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/new"
              element={
                <ProtectedRoute>
                  <QuoteEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/:id"
              element={
                <ProtectedRoute>
                  <QuoteEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties"
              element={
                <ProtectedRoute>
                  <Parties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalog"
              element={
                <ProtectedRoute>
                  <Catalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Command Center */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
