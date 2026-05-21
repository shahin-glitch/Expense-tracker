import React, { useState, useEffect, useCallback } from 'react';
import { budgetAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCurrency, getCategoryColor, getCategoryIcon, MONTHS } from '../utils/constants';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Target, Wallet, Scale, Plus, X } from 'lucide-react';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ category: 'Food & Dining', amount: '' });
  const [saving, setSaving] = useState(false);

  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getAll({ month, year });
      setBudgets(res.data.budgets);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await budgetAPI.create({ ...form, month, year });
      toast.success('Budget saved!');
      setForm({ category: 'Food & Dining', amount: '' });
      setShowForm(false);
      fetchBudgets();
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await budgetAPI.delete(id);
      toast.success('Budget removed');
      fetchBudgets();
    } catch { toast.error('Delete failed'); }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <motion.div variants={itemVariants}>
          <h1 className="page-title">Budgets🦉</h1>
          <p className="page-subtitle">Set and track your spending limits😡Or ELSE HMMMMM😡😡</p>
        </motion.div>
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12 }}>
          <select className="form-control" style={{ width: 'auto', borderRadius: 12, padding: '10px 16px' }}
            value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto', borderRadius: 12, padding: '10px 16px' }}
            value={year} onChange={e => setYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} strokeWidth={2.5} /> Set Budget
          </button>
        </motion.div>
      </div>

      <div className="page-body">
        {/* Summary */}
        {budgets.length > 0 && (
          <div className="grid-3 mb-8">
            <motion.div variants={itemVariants} className="stat-card blue">
              <div className="stat-icon blue"><Target size={28} strokeWidth={2.5} /></div>
              <div className="stat-label">Total Budgeted</div>
              <div className="stat-value blue">{fmt(totalBudgeted)}</div>
            </motion.div>
            <motion.div variants={itemVariants} className="stat-card red">
              <div className="stat-icon red"><Wallet size={28} strokeWidth={2.5} /></div>
              <div className="stat-label">Total Spent</div>
              <div className="stat-value red">{fmt(totalSpent)}</div>
            </motion.div>
            <motion.div variants={itemVariants} className={`stat-card ${totalBudgeted - totalSpent >= 0 ? 'green' : 'red'}`}>
              <div className={`stat-icon ${totalBudgeted - totalSpent >= 0 ? 'green' : 'red'}`}><Scale size={28} strokeWidth={2.5} /></div>
              <div className="stat-label">Remaining</div>
              <div className={`stat-value ${totalBudgeted - totalSpent >= 0 ? 'green' : 'red'}`}>
                {fmt(Math.abs(totalBudgeted - totalSpent))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Budget grid */}
        {loading ? (
          <div className="grid-auto">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 20 }} />)}
          </div>
        ) : budgets.length > 0 ? (
          <div className="grid-auto">
            {budgets.map((budget, idx) => {
              const pct = Math.min((budget.spent / budget.amount) * 100, 100);
              const isOver = budget.spent > budget.amount;
              return (
                <motion.div variants={itemVariants} key={budget._id} className="card" style={{ position: 'relative', overflow: 'hidden', padding: 24 }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: 4,
                    width: `${pct}%`,
                    background: isOver ? 'var(--accent-red)' : pct > 75 ? '#F97316' : getCategoryColor(budget.category),
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 10px ${isOver ? 'var(--accent-red)' : pct > 75 ? '#F97316' : getCategoryColor(budget.category)}80`
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        fontSize: 24, 
                        width: 48, height: 48, 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: 12, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {getCategoryIcon(budget.category)}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{budget.category}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(budget._id)}
                      style={{ padding: 6, opacity: 0.6, borderRadius: 8 }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Spent: <strong style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-primary)' }}>{fmt(budget.spent)}</strong></span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>of {fmt(budget.amount)}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{
                        width: `${pct}%`,
                        background: isOver ? 'var(--accent-red)' : pct > 75 ? '#F97316' : getCategoryColor(budget.category),
                        boxShadow: `0 0 10px ${isOver ? 'var(--accent-red)' : pct > 75 ? '#F97316' : getCategoryColor(budget.category)}80`
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
                    <span style={{ color: isOver ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {isOver ? `⚠ Over by ${fmt(budget.spent - budget.amount)}` : `${fmt(budget.remaining)} remaining`}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{pct.toFixed(0)}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div variants={itemVariants} className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-text">No budgets set for {MONTHS[month - 1]} {year}</div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>Set Your First Budget</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Budget Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header" style={{ paddingBottom: 24, borderBottom: '1px solid var(--border-bright)' }}>
              <span>Set Budget</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} style={{ padding: 4 }}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ paddingTop: 24 }}>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ borderRadius: 12 }}>
                    {CATEGORIES.filter(c => !['Salary','Freelance','Investment'].includes(c.name))
                      .map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Limit</label>
                  <input className="form-control" type="number" step="0.01" min="1" placeholder="0.00"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required style={{ borderRadius: 12 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
