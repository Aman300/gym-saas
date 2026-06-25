import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit3, Trash2, ShieldAlert, History } from 'lucide-react';

export const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || '';

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentMemberId, setCurrentMemberId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [planId, setPlanId] = useState('');
  const [membershipStart, setMembershipStart] = useState('');
  const [membershipEnd, setMembershipEnd] = useState('');
  const [status, setStatus] = useState('active');
  const [membershipStatus, setMembershipStatus] = useState('unpaid');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // History Modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formError, setFormError] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      let endpoint = `/members?page=${currentPage}&limit=${itemsPerPage}&search=${search}`;
      if (statusFilter) {
        endpoint += `&status=${statusFilter}`;
      }
      const res = await api.get(endpoint);
      if (res.success) {
        setMembers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setTotalMembersCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      if (res.success) {
        setPlans(res.data);
        if (res.data.length > 0) {
          setPlanId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchPlans();
    // Default start date is today
    const today = new Date().toISOString().split('T')[0];
    setMembershipStart(today);
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add' && plans.length > 0) {
      openAddModal();
      setSearchParams({});
    }
  }, [searchParams, plans]);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentMemberId(null);
    setName('');
    setEmail('');
    setPhone('');
    setGender('male');
    setDob('');
    if (plans.length > 0) setPlanId(plans[0]._id);
    setMembershipStart(new Date().toISOString().split('T')[0]);
    setMembershipEnd('');
    setStatus('active');
    setMembershipStatus('unpaid');
    setEmergencyName('');
    setEmergencyPhone('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setModalMode('edit');
    setCurrentMemberId(member._id);
    setName(member.name);
    setEmail(member.email || '');
    setPhone(member.phone);
    setGender(member.gender || 'male');
    setDob(member.dob ? new Date(member.dob).toISOString().split('T')[0] : '');
    setPlanId(member.planId?._id || '');
    setMembershipStart(new Date(member.membershipStart).toISOString().split('T')[0]);
    setMembershipEnd(member.membershipEnd ? new Date(member.membershipEnd).toISOString().split('T')[0] : '');
    setStatus(member.status);
    setMembershipStatus(member.membershipStatus);
    setEmergencyName(member.emergencyContact?.name || '');
    setEmergencyPhone(member.emergencyContact?.phone || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const openHistoryModal = async (member) => {
    setHistoryMember(member);
    setMemberHistory([]);
    setLoadingHistory(true);
    setIsHistoryModalOpen(true);
    try {
      const res = await api.get(`/payments?memberId=${member._id}&limit=100`);
      if (res.success) {
        setMemberHistory(res.data);
      }
    } catch (err) {
      console.error('Error fetching member history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      const res = await api.delete(`/members/${id}`);
      if (res.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !planId) {
      setFormError('Please fill in Name, Phone, and select a Plan.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      gender,
      dob: dob || undefined,
      planId,
      membershipStart,
      membershipEnd: membershipEnd || undefined,
      status,
      membershipStatus,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone
      }
    };

    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/members', payload);
      } else {
        res = await api.put(`/members/${currentMemberId}`, payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchMembers();
      } else {
        setFormError(res.message || 'Error occurred while saving member.');
      }
    } catch (err) {
      setFormError('Connection issue. Please try again.');
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
    if (filter) {
      setSearchParams({ filter });
    } else {
      setSearchParams({});
    }
  };

  const showStart = members.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showEnd = showStart + members.length - 1;

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Gym Members</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Register and manage your members catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters & Search section */}
      <div className="glass-card mb-4" style={{ padding: '1rem 1.25rem' }}>
        <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'center' }}>
          <div className="flex-align-center" style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="text"
                placeholder="Search by name, phone, code or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => handleFilterChange('')}
            >
              All
            </button>
            <button
              className={`btn ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => handleFilterChange('active')}
            >
              Active
            </button>
            <button
              className={`btn ${statusFilter === 'expired' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => handleFilterChange('expired')}
            >
              Expired
            </button>
            <button
              className={`btn ${statusFilter === 'inactive' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => handleFilterChange('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Member Code</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Assigned Plan</th>
              <th>Plan Price</th>
              <th>Membership Expiry</th>
              <th>Billing</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} style={{ pointerEvents: 'none' }}>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '80px', height: '1.25rem', marginBottom: 0 }}></div>
                  </td>
                  <td>
                    <div>
                      <div className="skeleton skeleton-text" style={{ width: '120px', height: '1rem', marginBottom: '0.25rem' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '150px', height: '0.75rem', marginBottom: 0 }}></div>
                    </div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '100px', height: '1rem', marginBottom: 0 }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '110px', height: '1rem', marginBottom: 0 }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '1rem', marginBottom: 0 }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '90px', height: '1rem', marginBottom: 0 }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-rect" style={{ width: '60px', height: '1.5rem', borderRadius: '9999px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-rect" style={{ width: '60px', height: '1.5rem', borderRadius: '9999px' }}></div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem', justifyContent: 'flex-end', width: '100%' }}>
                      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                  No members found matching your search.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member._id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{member.memberCode}</td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600 }}>{member.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{member.email}</p>
                    </div>
                  </td>
                  <td>{member.phone}</td>
                  <td>{member.planId?.name || 'No Plan'}</td>
                  <td>₹{member.planId?.price || 0}</td>
                  <td>
                    <span style={{
                      color: new Date(member.membershipEnd) < new Date() ? 'var(--danger)' : 'var(--text-primary)',
                      fontWeight: new Date(member.membershipEnd) < new Date() ? '700' : 'normal'
                    }}>
                      {new Date(member.membershipEnd).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${member.membershipStatus}`}>
                      {member.membershipStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${member.status}`}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => openHistoryModal(member)} title="View Payment & Renewal History">
                        <History size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => openEditModal(member)} title="Edit Details">
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(member._id)} title="Delete Member">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-between" style={{ marginTop: '1.5rem', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {showStart} to {showEnd} of {totalMembersCount} members
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Member' : 'Edit Member Details'}
      >
        {formError && (
          <div className="auth-error flex-align-center" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h4 style={{ margin: '0 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase' }}>General Info</h4>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Robert Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className="form-input"
                type="text"
                placeholder="555-019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="robert@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ margin: '1.25rem 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase' }}>Membership Details</h4>

          <div className="form-group">
            <label className="form-label">Membership Plan *</label>
            <select className="form-input" value={planId} onChange={(e) => setPlanId(e.target.value)} required>
              {plans.length === 0 ? (
                <option value="">-- No plans configured yet --</option>
              ) : (
                plans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))
              )}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                className="form-input"
                type="date"
                value={membershipStart}
                onChange={(e) => setMembershipStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date (Override)</label>
              <input
                className="form-input"
                type="date"
                value={membershipEnd}
                onChange={(e) => setMembershipEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="form-input" value={membershipStatus} onChange={(e) => setMembershipStatus(e.target.value)}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <h4 style={{ margin: '1.25rem 0 0.75rem 0', opacity: 0.8, fontSize: '0.825rem', textTransform: 'uppercase' }}>Emergency Contact</h4>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Jane Smith"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                className="form-input"
                type="text"
                placeholder="555-983-2039"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              {modalMode === 'add' ? 'Create Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Membership History: ${historyMember?.name || ''}`}
      >
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <strong>Member Code:</strong> {historyMember?.memberCode}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <strong>Current Active Plan:</strong> {historyMember?.planId?.name || 'None'} (₹{historyMember?.planId?.price || 0})
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Current Membership Expiry:</strong> {historyMember?.membershipEnd ? new Date(historyMember.membershipEnd).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {loadingHistory ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>Loading transactions ledger...</p>
          ) : memberHistory.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>No historical subscription or payment records found for this member.</p>
          ) : (
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Plan Purchased</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Notes/Remarks</th>
                </tr>
              </thead>
              <tbody>
                {memberHistory.map((h) => (
                  <tr key={h._id}>
                    <td style={{ fontWeight: 600 }}>{h.planId?.name || 'Deleted Plan'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{h.amount}</td>
                    <td>{new Date(h.paymentDate).toLocaleDateString()} {new Date(h.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.35rem' }}>{h.paymentMethod}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{h.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
          <button className="btn btn-secondary" type="button" onClick={() => setIsHistoryModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Members;
