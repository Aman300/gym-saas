import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Search, IndianRupee, ShieldAlert, CreditCard } from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPaymentsCount, setTotalPaymentsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const itemsPerPage = 10;

  // Form states
  const [memberId, setMemberId] = useState('');
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments?page=${currentPage}&limit=${itemsPerPage}`);
      if (res.success) {
        setPayments(res.data);
        if (res.totalRevenue !== undefined) {
          setTotalRevenue(res.totalRevenue);
        }
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setTotalPaymentsCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      if (res.success) {
        setMembers(res.data);
        if (res.data.length > 0) {
          setMemberId(res.data[0]._id);
          // Set initial plan details based on first member
          const firstMember = res.data[0];
          setPlanId(firstMember.planId?._id || '');
          setAmount(firstMember.planId?.price || '');
        }
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  useEffect(() => {
    fetchMembers();
  }, []);

  // When selected member changes, update default plan and amount automatically
  const handleMemberChange = (id) => {
    setMemberId(id);
    const selectedMember = members.find(m => m._id === id);
    if (selectedMember && selectedMember.planId) {
      setPlanId(selectedMember.planId._id);
      setAmount(selectedMember.planId.price);
    } else {
      setPlanId('');
      setAmount('');
    }
  };

  const openPaymentModal = () => {
    if (members.length === 0) {
      alert('Please register at least one member before recording payments.');
      return;
    }
    setFormError('');
    setNotes('');
    setPaymentMethod('cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    // Seed with first member again
    const firstMember = members[0];
    setMemberId(firstMember._id);
    setPlanId(firstMember.planId?._id || '');
    setAmount(firstMember.planId?.price || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId || !planId || amount === '') {
      setFormError('Please select a member and enter a valid amount.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await api.post('/payments', {
        memberId,
        planId,
        amount: parseFloat(amount),
        paymentMethod,
        paymentDate,
        notes
      });

      if (res.success) {
        setIsModalOpen(false);
        fetchPayments();
        // Also refresh members list to update payment statuses
        fetchMembers();
        setCurrentPage(1);
      } else {
        setFormError(res.message || 'Error recording transaction.');
      }
    } catch (err) {
      setFormError('Network connection issue. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const showStart = payments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showEnd = showStart + payments.length - 1;

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Log sales and invoice transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openPaymentModal}>
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Stats cards for payments */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Total Cash Flow In</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              ₹{totalRevenue}
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Transactions Logged</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {totalPaymentsCount} invoices
            </h3>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Member Code</th>
              <th>Assigned Plan</th>
              <th>Amount Paid</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading transaction history...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                  No payment invoices recorded yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <p style={{ fontWeight: 600 }}>{payment.memberId?.name || 'Deleted Member'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{payment.memberId?.phone}</p>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{payment.memberId?.memberCode}</td>
                  <td>{payment.planId?.name}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>+₹{payment.amount}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()} {new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{payment.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-between" style={{ marginTop: '1.5rem', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {showStart} to {showEnd} of {totalPaymentsCount} invoices
          </span>
          <div className="flex-align-center" style={{ gap: '0.35rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  minWidth: '32px'
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Record payment modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Membership Bill Payment">
        {formError && (
          <div className="auth-error flex-align-center" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Client / Member *</label>
            <select
              className="form-input"
              value={memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              required
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.memberCode}) - Plan: {m.planId?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Payment Amount (INR) *</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  type="number"
                  placeholder="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select
                className="form-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Credit / Debit Card</option>
                <option value="online">Online / UPI / NetBanking</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Date *</label>
            <input
              className="form-input"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Notes</label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', fontFamily: 'var(--font-primary)' }}
              placeholder="e.g. Month renewal payment, or paid partial cash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Recording invoice...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
