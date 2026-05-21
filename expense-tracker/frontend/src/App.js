import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import { motion, AnimatePresence } from 'framer-motion';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--gradient-primary)', margin: '0 auto 20px', boxShadow: '0 0 20px var(--accent-purple)' }}></div>
        <div style={{ color: 'var(--text-primary)', fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: 1 }}>SpendWise</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Loading workspace...</div>
      </motion.div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/*" element={
        <ProtectedRoute><AppLayout /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 22, 0.9)',
              backdropFilter: 'blur(10px)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            },
            success: { iconTheme: { primary: '#00E5A0', secondary: '#000' } },
            error: { iconTheme: { primary: '#FF4757', secondary: '#fff' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
