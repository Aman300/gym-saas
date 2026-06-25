import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import {
  Plus,
  Edit3,
  Trash2,
  ShieldAlert,
  Building2,
  CheckCircle,
  XCircle,
  Users,
  Key,
  IndianRupee,
  Receipt
} from 'lucide-react';

export const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentTenantId, setCurrentTenantId] = useState(null);

  // Form states
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Subscription Form states
  const [subscriptionPlan, setSubscriptionPlan] = useState('trial');
  const [durationMonths, setDurationMonths] = useState(1);
  const [subPlan, setSubPlan] = useState('trial');
  const [subStatus, setSubStatus] = useState('trialing');
  const [subEnd, setSubEnd] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await api.get('/superadmin/tenants');
      if (res.success) {
        setTenants(res.data);
      }
    } catch (err) {
      console.error('Error fetching tenants list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentTenantId(null);
    setGymName('');
    setOwnerName('');
    setEmail('');
    setPassword('');
    setAddress('');
    setPhone('');
    setSubscriptionPlan('trial');
    setDurationMonths(1);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tenant) => {
    setModalMode('edit');
    setCurrentTenantId(tenant._id);
    setGymName(tenant.name);
    setOwnerName(''); // No owner name edit
    setEmail('');     // No email edit
    setPassword('');  // No password edit
    setAddress(tenant.address || '');
    setPhone(tenant.phone || '');
    setSubPlan(tenant.subscriptionPlan || 'trial');
    setSubStatus(tenant.subscriptionStatus || 'trialing');
    setSubEnd(tenant.subscriptionEnd ? new Date(tenant.subscriptionEnd).toISOString().split('T')[0] : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await api.put(`/superadmin/tenants/${id}`, { isActive: !currentStatus });
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      console.error('Error toggling tenant status:', err);
    }
  };

  const handleDelete = async (id, name) => {
    const doubleCheck = window.confirm(
      `CRITICAL WARNING:\nAre you sure you want to delete "${name}"?\n\nThis will completely purge this gym branch, its plans, all members, log records, payments, and staff users permanently. This cannot be undone.`
    );
    if (!doubleCheck) return;

    try {
      const res = await api.delete(`/superadmin/tenants/${id}`);
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymName) {
      setFormError('Please enter the gym name.');
      return;
    }

    if (modalMode === 'add' && (!ownerName || !email || !password)) {
      setFormError('Please enter owner details (name, email, password) to onboard the gym.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/superadmin/tenants', {
          gymName,
          ownerName,
          email,
          password,
          address,
          phone,
          subscriptionPlan,
          durationMonths
        });
      } else {
        res = await api.put(`/superadmin/tenants/${currentTenantId}`, {
          name: gymName,
          address,
          phone,
          subscriptionPlan: subPlan,
          subscriptionStatus: subStatus,
          subscriptionEnd: subEnd
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchTenants();
      } else {
        setFormError(res.message || 'Error occurred while saving tenant.');
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
          <h1 className="page-title">Gym Branches</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Register, deactivate, and audit multi-tenant branch accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Onboard Gym</span>
        </button>
      </div>

      {/* Tenants Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Gym Name & Slug</th>
              <th>Created On</th>
              <th>Telemetry (Members/Staff)</th>
              <th>Platform Flow</th>
              <th>Subscription Info</th>
              <th>Active Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading branch accounts...
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                  No gym branches onboarded yet.
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        slug: {t.slug}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Ph: {t.phone} | Addr: {t.address}
                      </p>
                    </div>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Users size={12} className="text-info" /> {t.membersCount} members
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Key size={12} style={{ color: 'var(--primary)' }} /> {t.usersCount} staff members
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                        <IndianRupee size={12} /> +₹{t.revenue}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                        <Receipt size={12} /> -₹{t.expenses}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="badge" style={{ textTransform: 'uppercase', fontWeight: 700, width: 'fit-content', background: t.subscriptionPlan === 'trial' ? 'var(--warning-light)' : 'var(--primary-light)', color: t.subscriptionPlan === 'trial' ? 'var(--warning)' : 'var(--primary)', padding: '0.15rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}>
                        {t.subscriptionPlan} Plan
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Expires: {t.subscriptionEnd ? new Date(t.subscriptionEnd).toLocaleDateString() : 'Never'}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', color: t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trialing' ? 'var(--success)' : 'var(--danger)' }}>
                        Status: {t.subscriptionStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleActive(t._id, t.isActive)}
                        className="btn-icon"
                        style={{
                          background: t.isActive ? 'var(--success-light)' : 'var(--danger-light)',
                          color: t.isActive ? 'var(--success)' : 'var(--danger)',
                          borderRadius: '20px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none'
                        }}
                        title={t.isActive ? 'Click to suspend' : 'Click to activate'}
                      >
                        {t.isActive ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => openEditModal(t)} title="Edit details">
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(t._id, t.name)}
                        title="Delete branch permanently"
                      >
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

      {/* Onboard / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Onboard New Gym Branch' : 'Modify Branch Details'}
      >
        {formError && (
          <div className="auth-error flex-align-center" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Gym Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Iron Gym, Elite Fitness Center"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gym Location / Address</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Chakan, Pune"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {modalMode === 'add' && (
            <>
              <h4 style={{ margin: '1.25rem 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                Primary Owner Account
              </h4>
              
              <div className="form-group">
                <label className="form-label">Owner Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Aman Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required={modalMode === 'add'}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Owner Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="e.g. owner@irongym.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={modalMode === 'add'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Password *</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={modalMode === 'add'}
                    minLength="6"
                  />
                </div>
              </div>
            </>
          )}

          {modalMode === 'add' && (
            <>
              <h4 style={{ margin: '1.25rem 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                Subscription Setup
              </h4>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Subscription Tier *</label>
                  <select className="form-input" value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} required>
                    <option value="trial">30-Day Free Trial</option>
                    <option value="basic">Basic Plan</option>
                    <option value="premium">Premium Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Months) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {modalMode === 'edit' && (
            <>
              <h4 style={{ margin: '1.25rem 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                Manage Subscription
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subscription Tier</label>
                  <select className="form-input" value={subPlan} onChange={(e) => setSubPlan(e.target.value)}>
                    <option value="trial">Trial Plan</option>
                    <option value="basic">Basic Plan</option>
                    <option value="premium">Premium Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subscription Status</label>
                  <select className="form-input" value={subStatus} onChange={(e) => setSubStatus(e.target.value)}>
                    <option value="trialing">Trialing</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={subEnd}
                    onChange={(e) => setSubEnd(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving details...' : modalMode === 'add' ? 'Onboard Gym' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tenants;
