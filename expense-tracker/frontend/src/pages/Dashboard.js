import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCurrency, getCategoryColor, getCategoryIcon, MONTHS } from '../utils/constants';
import ExpenseModal from '../components/ExpenseModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Activity, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, expensesRes] = await Promise.all([
        expenseAPI.getStats({ month: currentMonth, year: currentYear }),
        expenseAPI.getAll({ limit: 5, sortBy: 'date', order: 'desc' })
      ]);
      setStats(statsRes.data);
      setRecentExpenses(expensesRes.data.expenses);
    } catch (err) {
      toast.error('Failed to load data MEOOOOOOOWWWWW');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currency = user?.currency || 'USD';
  const fmt = (n) => formatCurrency(n, currency);

  // Monthly trend data for area chart
  const monthlyChartData = React.useMemo(() => {
    if (!stats?.monthlyTrend) return [];
    const map = {};
    stats.monthlyTrend.forEach(({ _id, total }) => {
      const key = `${MONTHS[_id.month - 1]} ${_id.year}`;
      if (!map[key]) map[key] = { name: key, income: 0, expense: 0 };
      map[key][_id.type] += total;
    });
    return Object.values(map);
  }, [stats]);

  const net = (stats?.summary?.totalIncome || 0) - (stats?.summary?.totalExpenses || 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="card" style={{ padding: '12px 16px', minWidth: 160, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ fontSize: 14, color: p.color, fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span>{p.name}</span>
              <span>{fmt(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 20 }} />)}
      </div>
      <div className="grid-2">
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 20 }} />)}
      </div>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <motion.div variants={itemVariants}>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview for {MONTHS[currentMonth - 1]} {currentYear} I hope ur not BROKE☹️🫴</p>
        </motion.div>
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}
            value={currentMonth} onChange={e => setCurrentMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}
            value={currentYear} onChange={e => setCurrentYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} strokeWidth={2.5} /> Add Transaction
          </button>
        </motion.div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="grid-4 mb-8">
          <motion.div variants={itemVariants} className="stat-card green">
            <div className="stat-icon green"><TrendingUp size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Total Income🐈</div>
            <div className="stat-value green">{fmt(stats?.summary?.totalIncome || 0)}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card red">
            <div className="stat-icon red"><TrendingDown size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Total Expenses🙀</div>
            <div className="stat-value red">{fmt(stats?.summary?.totalExpenses || 0)}</div>
          </motion.div>
          <motion.div variants={itemVariants} className={`stat-card ${net >= 0 ? 'blue' : 'red'}`}>
            <div className={`stat-icon ${net >= 0 ? 'blue' : 'red'}`}><Wallet size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Net Balance🚨</div>
            <div className={`stat-value ${net >= 0 ? 'blue' : 'red'}`}>{fmt(Math.abs(net))}</div>
            <div className="stat-change">{net >= 0 ? '▲ Surplus' : '▼ Deficit'}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card purple">
            <div className="stat-icon purple"><Activity size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Transactions😶‍🌫️</div>
            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{stats?.summary?.count || 0}</div>
            <div className="stat-change">This month</div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid-2 mb-8">
          {/* Monthly trend */}
          <motion.div variants={itemVariants} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              6-Month Overview
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(118, 58, 201, 0.15)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category breakdown */}
          <motion.div variants={itemVariants} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
              Spending by Category
            </div>
            {stats?.categoryBreakdown?.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: 260 }}>
                <ResponsiveContainer width={200} height="100%">
                  <PieChart>
                    <Pie data={stats.categoryBreakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="none">
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={index} fill={getCategoryColor(entry._id)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stats.categoryBreakdown.slice(0, 4).map((cat) => {
                    const total = stats.summary.totalExpenses || 1;
                    const pct = ((cat.total / total) * 100).toFixed(0);
                    return (
                      <div key={cat._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{getCategoryIcon(cat._id)}</span> {cat._id}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{pct}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: getCategoryColor(cat._id), boxShadow: `0 0 10px ${getCategoryColor(cat._id)}80` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="empty-state-icon">🍩</div>
                <div className="empty-state-text">No expenses this month😼 HAHAHa</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 32px 24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Recent Transactions</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>View all <ArrowRight size={16} /></button>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="table-wrapper">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 32 }}>Transaction</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right', paddingRight: 32 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(exp => (
                    <tr key={exp._id}>
                      <td style={{ paddingLeft: 32 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</div>
                        {exp.note && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{exp.note}</div>}
                      </td>
                      <td>
                        <span className="category-pill">
                          {getCategoryIcon(exp.category)} {exp.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, paddingRight: 32, fontSize: 16 }}>
                        <span className={exp.type === 'income' ? 'text-green' : 'text-red'}>
                          {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ margin: '0 32px 32px' }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No transactions yet</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add your first one</button>
            </div>
          )}
        </motion.div>
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </motion.div>
  );
}
