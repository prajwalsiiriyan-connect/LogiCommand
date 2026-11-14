import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider }         from './context/ToastContext';
import Layout                    from './components/Layout/Layout';
import Login                     from './pages/Login';
import Dashboard                 from './pages/Dashboard';
import Shipments                 from './pages/Shipments';
import Inventory                 from './pages/Inventory';
import Orders                    from './pages/Orders';
import Suppliers                 from './pages/Suppliers';
import RoutesPage                from './pages/RoutesPage';
import Reports                   from './pages/Reports';
import Alerts                    from './pages/Alerts';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading LogiCommand…</p>
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index         element={<Dashboard />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders"    element={<Orders />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="routes"    element={<RoutesPage />} />
            <Route path="reports"   element={<Reports />} />
            <Route path="alerts"    element={<Alerts />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
