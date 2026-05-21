import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
                Get started
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
                Create your free SpendWise account, So you can by me 😼😽😽😽
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="John Doe"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <motion.button 
                type="submit" 
                className="btn btn-primary w-full btn-lg" 
                disabled={loading} 
                style={{ justifyContent: 'center' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </motion.button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 24 }}>
              Already have an account?👽{' '}
              <Link to="/login" style={{ color: 'var(--main-purple)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
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
