import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Receipt, ShieldAlert, Edit3, Trash2, Calendar, IndianRupee } from 'lucide-react';

export const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentExpenseId, setCurrentExpenseId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('rent');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentExpenseId(null);
    setTitle('');
    setCategory('rent');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setModalMode('edit');
    setCurrentExpenseId(exp._id);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setExpenseDate(new Date(exp.expenseDate).toISOString().split('T')[0]);
    setDescription(exp.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || amount === '') {
      setFormError('Please fill in Title, Category, and Amount.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      title,
      category,
      amount: parseFloat(amount),
      expenseDate,
      description
    };

    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/expenses', payload);
      } else {
        res = await api.put(`/expenses/${currentExpenseId}`, payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchExpenses();
      } else {
        setFormError(res.message || 'Error occurred while saving expense.');
      }
    } catch (err) {
      setFormError('Network connection issue. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Expenses Ledger</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Monitor and catalog your gym's operational costs</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense aggregation cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <Receipt size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Total Operational Outgoings</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              ₹{expenses.reduce((acc, e) => acc + e.amount, 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Expenses list */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Expense Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date incurred</th>
              <th>Description / Remarks</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading operational logs...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                  No expense records logged yet.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>
                    <p style={{ fontWeight: 600 }}>{expense.title}</p>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>-₹{expense.amount}</td>
                  <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{expense.description || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => openEditModal(expense)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(expense._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Log Gym Expense' : 'Modify Expense Log'}>
        {formError && (
          <div className="auth-error flex-align-center" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Title / Vendor Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Utility Power Bill, Janitorial supplies, Gym Rent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Expense Amount (INR) *</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  type="number"
                  placeholder="300"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="rent">Rent / Office lease</option>
                <option value="utilities">Utilities (Water, Power, Net)</option>
                <option value="salaries">Salaries & Trainer Commissions</option>
                <option value="maintenance">Maintenance & Repair</option>
                <option value="marketing">Advertising & Marketing</option>
                <option value="other">Other Operational Costs</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Billing Date *</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Details</label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', fontFamily: 'var(--font-primary)' }}
              placeholder="Provide context like month, items purchased, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Recording costs...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
