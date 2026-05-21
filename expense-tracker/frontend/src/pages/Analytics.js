import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getCategoryColor, getCategoryIcon, MONTHS } from '../utils/constants';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, Activity, BarChart2 } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseAPI.getStats({ month, year });
      setStats(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const dailyData = React.useMemo(() => {
    if (!stats?.dailyTrend) return [];
    const map = {};
    stats.dailyTrend.forEach(({ _id, total }) => {
      const day = _id.day;
      if (!map[day]) map[day] = { day: `${day}`, income: 0, expense: 0 };
      map[day][_id.type] += total;
    });
    return Object.values(map).sort((a, b) => parseInt(a.day) - parseInt(b.day));
  }, [stats]);

  const monthlyData = React.useMemo(() => {
    if (!stats?.monthlyTrend) return [];
    const map = {};
    stats.monthlyTrend.forEach(({ _id, total }) => {
      const key = `${MONTHS[_id.month - 1]}`;
      if (!map[key]) map[key] = { name: key, income: 0, expense: 0 };
      map[key][_id.type] += total;
    });
    return Object.values(map);
  }, [stats]);

  const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
    <div className="card" style={{ padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', minWidth: 140 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: 4 }}>
          <span>{p.name}</span>
          <span>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  ) : null;

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
      <div className="skeleton" style={{ height: 300, borderRadius: 20, marginBottom: 20 }} />
      <div className="grid-2">
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 20 }} />)}
      </div>
    </div>
  );

  const totalExpenses = stats?.summary?.totalExpenses || 0;
  const totalIncome = stats?.summary?.totalIncome || 0;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <motion.div variants={itemVariants}>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights into your spending patterns</p>
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
        </motion.div>
      </div>

      <div className="page-body">
        {/* KPI row */}
        <div className="grid-4 mb-8">
          <motion.div variants={itemVariants} className="stat-card green">
            <div className="stat-icon green"><TrendingUp size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Income</div>
            <div className="stat-value green">{fmt(totalIncome)}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card red">
            <div className="stat-icon red"><TrendingDown size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Expenses</div>
            <div className="stat-value red">{fmt(totalExpenses)}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card blue">
            <div className="stat-icon blue"><PiggyBank size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value blue">{savingsRate}%</div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card purple">
            <div className="stat-icon purple"><Activity size={28} strokeWidth={2.5} /></div>
            <div className="stat-label">Transactions</div>
            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{stats?.summary?.count || 0}</div>
          </motion.div>
        </div>

        {/* Daily spending chart */}
        <motion.div variants={itemVariants} className="card mb-8">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
            Daily Cash Flow — {MONTHS[month - 1]} {year}
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="income" fill="#00E5A0" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#FF4757" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="empty-state-icon"><BarChart2 size={48} opacity={0.5} /></div>
              <div className="empty-state-text">No data for this period</div>
            </div>
          )}
        </motion.div>

        <div className="grid-2 mb-8">
          {/* Monthly trend */}
          <motion.div variants={itemVariants} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
              Monthly Trend
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" stroke="#00E5A0" strokeWidth={3} dot={{ fill: '#00E5A0', r: 5, strokeWidth: 0 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#FF4757" strokeWidth={3} dot={{ fill: '#FF4757', r: 5, strokeWidth: 0 }} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category donut */}
          <motion.div variants={itemVariants} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
              Category Breakdown
            </div>
            {stats?.categoryBreakdown?.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', height: 260, gap: 24 }}>
                <ResponsiveContainer width={200} height="100%">
                  <PieChart>
                    <Pie data={stats.categoryBreakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="none">
                      {stats.categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={getCategoryColor(entry._id)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.categoryBreakdown.slice(0, 5).map(cat => (
                    <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8 }}>
                      <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: getCategoryColor(cat._id), display: 'inline-block', boxShadow: `0 0 8px ${getCategoryColor(cat._id)}80` }} />
                        {cat._id}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="empty-state-icon">🍩</div>
                <div className="empty-state-text">No expense data</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
