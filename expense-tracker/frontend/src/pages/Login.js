import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back BABY.......!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed, GAY BOY');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setForm({ email: 'demo@example.com', password: 'demo123' });
    setLoading(true);
    try {
      await login('demo@example.com', 'demo123');
      toast.success('Welcome back BABY.......!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed, GAY BOY');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left column (Form) */}
        <motion.div 
          className="auth-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              {/* Logo Section */}
              <div style={{ display: 'inline-block', marginBottom: 20 }}>
                <motion.div 
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{ cursor: 'pointer' }}
                >
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="16" fill="url(#logoGrad)" />
                    <path d="M30 14V46" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M22 20H33.5C36.5 20 38.5 21.5 38.5 24.5C38.5 27.5 36.5 29 33.5 29H22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 29H35C38 29 40 30.5 40 33.5C40 36.5 38 38 35 38H22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="logoGrad" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8A6DC8" />
                        <stop offset="1" stopColor="#763AC9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                Welcome back
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
                Sign in to your SpendWise account, and use this sht
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <motion.button 
                type="submit" 
                className="btn btn-primary w-full btn-lg" 
                disabled={loading} 
                style={{ justifyContent: 'center' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <motion.button 
              type="button" 
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn w-full btn-lg" 
              style={{ 
                justifyContent: 'center', 
                marginTop: 12,
                background: 'linear-gradient(135deg, rgba(138, 109, 200, 0.2), rgba(118, 58, 201, 0.2))',
                color: 'var(--main-purple)',
                border: '2px solid var(--main-purple)',
                fontWeight: 700,
                fontSize: 16
              }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Loading...' : '🎯 Try Demo Account'}
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 24 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--main-purple)', textDecoration: 'none', fontWeight: 600 }}>
                Create one
              </Link>
            </p>

            {/* Demo hint */}
            <div style={{
              marginTop: 24, padding: '14px 18px',
              background: 'rgba(118, 58, 201, 0.06)', borderRadius: 12,
              border: '1px solid rgba(118, 58, 201, 0.15)', fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              💡 <strong>Demo Mode:</strong> Click "Try Demo Account" to explore with demo@example.com / demo123, or register a new account to get started. 
            </div>
          </div>
        </motion.div>

        {/* Right column (Illustration/Image) */}
        <motion.div 
          className="auth-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        >
          <motion.div 
            className="auth-image-container"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
          >
            <img src="/auth_preview.png" alt="Dashboard Preview" className="auth-preview-img" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
