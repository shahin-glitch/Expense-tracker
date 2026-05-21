import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCurrency, getCategoryColor, getCategoryIcon } from '../utils/constants';
import ExpenseModal from '../components/ExpenseModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', search: '', page: 1 });

  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 15 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Deleted!');
      fetchExpenses();
    } catch { toast.error('Delete failed'); }
  };

  const handleEdit = (expense) => { setEditExpense(expense); setShowModal(true); };

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
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.total || 0} total transactions</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}>
            <Plus size={18} strokeWidth={2.5} /> Add Transaction
          </button>
        </motion.div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <motion.div variants={itemVariants} className="card mb-6" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={18} />
              </div>
              <input className="form-control" style={{ paddingLeft: 44, borderRadius: 12 }}
                placeholder="Search transactions..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
            </div>
            <select className="form-control" style={{ flex: '0 0 160px', borderRadius: 12 }}
              value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="form-control" style={{ flex: '0 0 200px', borderRadius: 12 }}
              value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {(filters.search || filters.type || filters.category) && (
              <button className="btn btn-secondary" style={{ borderRadius: 12, padding: '0 20px' }} onClick={() => setFilters({ type: '', category: '', search: '', page: 1 })}>
                <FilterX size={18} /> Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <div className="skeleton" style={{ height: 60, width: 60, borderRadius: '50%' }} />
                <div className="skeleton" style={{ height: 20, width: 200, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 400, borderRadius: 16, width: '100%' }} />
              </div>
            </div>
          ) : expenses && expenses.length > 0 ? (
            <>
              <div className="table-wrapper">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 32 }}>Transaction</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right', paddingRight: 32 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp._id}>
                        <td style={{ paddingLeft: 32 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</div>
                          {exp.note && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{exp.note}</div>}
                        </td>
                        <td>
                          <span className="category-pill" style={{ border: `1px solid ${getCategoryColor(exp.category)}40`, background: `${getCategoryColor(exp.category)}10` }}>
                            <span style={{ fontSize: 14 }}>{getCategoryIcon(exp.category)}</span> {exp.category}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${exp.type}`}>
                            {exp.type === 'income' ? '↑' : '↓'} {exp.type}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                          {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>
                          <span className={exp.type === 'income' ? 'text-green' : 'text-red'}>
                            {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: 32 }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" style={{ padding: 8, borderRadius: 8 }} onClick={() => handleEdit(exp)}>
                              <Edit3 size={16} />
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ padding: 8, borderRadius: 8 }} onClick={() => handleDelete(exp._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    Showing page {filters.page} of {pagination.pages}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }}
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }}
                      disabled={filters.page >= pagination.pages}
                      onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ margin: 32, padding: '60px 32px', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
              <div className="empty-state-text" style={{ marginBottom: 8 }}>No transactions found</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                {filters.search || filters.type || filters.category 
                  ? 'Try adjusting your filters or search term'
                  : 'Start by adding your first transaction'}
              </p>
              <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}>
                + Add Transaction
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {showModal && (
        <ExpenseModal
          onClose={() => { setShowModal(false); setEditExpense(null); }}
          onSaved={fetchExpenses}
          editExpense={editExpense}
        />
      )}
    </motion.div>
  );
}
