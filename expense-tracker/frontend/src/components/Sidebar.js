import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, Settings, LogOut } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { path: '/budgets', icon: Wallet, label: 'Budgets' },
  { path: '/analytics', icon: PieChart, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 14V46" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M22 20H33.5C36.5 20 38.5 21.5 38.5 24.5C38.5 27.5 36.5 29 33.5 29H22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 29H35C38 29 40 30.5 40 33.5C40 36.5 38 38 35 38H22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="logo-text">Spend<span>Wise</span></span>
      </div>

      <div className="nav-section" style={{ flex: 1 }}>
        <div className="nav-label">Main Menu</div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon"><Icon size={20} strokeWidth={2.5} /></span>
              {item.label}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--light-purple), var(--medium-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(118, 58, 201, 0.2)'
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</div>
          </div>
        </div>

        <button className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
          <span className="nav-icon"><Settings size={20} /></span> Settings
        </button>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--accent-red)' }}>
          <span className="nav-icon" style={{ color: 'var(--accent-red)' }}><LogOut size={20} /></span> Logout
        </button>
      </div>
    </nav>
  );
}
