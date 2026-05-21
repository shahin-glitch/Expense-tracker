import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    monthlyBudget: user?.monthlyBudget || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences KID🥸</p>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 520 }}>
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
              Profile Settings
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email} disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="form-control" value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Budget Goal</label>
                <input className="form-control" type="number" min="0" placeholder="0.00"
                  value={form.monthlyBudget}
                  onChange={e => setForm(f => ({ ...f, monthlyBudget: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="card mt-4" style={{ border: '1px solid rgba(255,71,87,0.2)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--accent-red)' }}>
              Danger Zone
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              These actions are irreversible. Please proceed with caution.
            </p>
            <button className="btn btn-danger">Delete All Transactions</button>
          </div>
        </div>
      </div>
    </div>
  );
}
