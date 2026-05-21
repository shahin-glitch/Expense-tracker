import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../utils/api';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '', amount: '', type: 'expense',
  category: 'Food & Dining', date: new Date().toISOString().split('T')[0], note: ''
};

export default function ExpenseModal({ onClose, onSaved, editExpense }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editExpense) {
      setForm({
        title: editExpense.title,
        amount: editExpense.amount,
        type: editExpense.type,
        category: editExpense.category,
        date: new Date(editExpense.date).toISOString().split('T')[0],
        note: editExpense.note || ''
      });
    }
  }, [editExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount)
      };
      if (editExpense) {
        await expenseAPI.update(editExpense._id, data);
        toast.success('Transaction updated!');
      } else {
        await expenseAPI.create(data);
        toast.success('Transaction added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other'];
  const expenseCategories = CATEGORIES.filter(c => !['Salary','Freelance','Investment'].includes(c.name));
  const filteredCats = form.type === 'income'
    ? CATEGORIES.filter(c => incomeCategories.includes(c.name))
    : expenseCategories;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>{editExpense ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 20 }}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Type Toggle */}
            <div className="form-group">
              <div className="type-toggle">
                <button type="button" className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'expense', category: 'Food & Dining' }))}>
                  ↓ Expense
                </button>
                <button type="button" className={`type-btn income ${form.type === 'income' ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Salary' }))}>
                  ↑ Income
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" placeholder="e.g. Coffee at Starbucks"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-control" type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-control" type="date"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {filteredCats.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Add a note..."
                value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editExpense ? 'Update' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
