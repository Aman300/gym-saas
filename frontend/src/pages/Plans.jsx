import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Edit3, Trash2, ShieldAlert, Award, Calendar, IndianRupee } from 'lucide-react';

export const Plans = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      setSearchParams({});
    }
  }, [searchParams]);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentPlanId(null);
    setName('');
    setPrice('');
    setDurationMonths(1);
    setDescription('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode('edit');
    setCurrentPlanId(plan._id);
    setName(plan.name);
    setPrice(plan.price);
    setDurationMonths(plan.durationMonths);
    setDescription(plan.description || '');
    setIsActive(plan.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) return;

    try {
      const res = await api.delete(`/plans/${id}`);
      if (res.success) {
        fetchPlans();
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price === '' || !durationMonths) {
      setFormError('Please fill in Name, Price, and Duration.');
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      durationMonths: parseInt(durationMonths, 10),
      description,
      isActive
    };

    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/plans', payload);
      } else {
        res = await api.put(`/plans/${currentPlanId}`, payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchPlans();
      } else {
        setFormError(res.message || 'Error occurred while saving plan.');
      }
    } catch (err) {
      setFormError('Connection issue. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Design subscription tiers and pricing packages for your clients</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Create Plan</span>
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
          <Award size={48} className="text-tertiary mb-3" style={{ margin: '0 auto' }} />
          <h3 className="mb-2">No Plans Created Yet</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Configure packages so your members can buy subscriptions</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            Create First Plan
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                opacity: plan.isActive ? 1 : 0.6,
                borderTop: `4px solid ${plan.isActive ? 'var(--primary)' : 'var(--text-tertiary)'}`
              }}
            >
              <div className="flex-between mb-3">
                <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {plan.isActive ? 'Active' : 'Disabled'}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-icon" onClick={() => openEditModal(plan)}>
                    <Edit3 size={16} />
                  </button>
                  <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(plan._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{plan.name}</h3>
              
              <div className="flex-align-center mb-3">
                <Calendar size={14} className="text-secondary" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Duration: {plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}
                </span>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                flex: 1,
                marginBottom: '1.5rem',
                minHeight: '40px'
              }}>
                {plan.description || 'Access to gym equipment during working hours.'}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: 'auto'
              }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.price}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                  / total package
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Create New Plan' : 'Edit Plan Details'}
      >
        {formError && (
          <div className="auth-error flex-align-center" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Monthly Standard, Platinum Annual"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Price (INR) *</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  type="number"
                  placeholder="99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Months) *</label>
              <select
                className="form-input"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                required
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Plan Description</label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', fontFamily: 'var(--font-primary)' }}
              placeholder="Features included in this membership..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Plan Availability</label>
            <div className="flex-align-center" style={{ gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Active & purchasable by new members
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              {modalMode === 'add' ? 'Create Plan' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
