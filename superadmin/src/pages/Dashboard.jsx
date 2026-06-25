import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Building2,
  Users,
  IndianRupee,
  CheckCircle,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/superadmin/dashboard');
        if (res.success) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Assembling platform telemetry...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="glass-card mb-4" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(129, 140, 248, 0.05) 100%)',
        borderLeft: '4px solid var(--primary)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles className="text-primary" size={24} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Platform Control Panel</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', maxW: '600px', fontSize: '0.925rem', lineHeight: '1.5' }}>
          Overview of global system activity across all gym tenants. Monitor branch activity, check cumulative cash flow volumes, and deploy new branches.
        </p>
      </div>

      {/* Grid for KPIs */}
      <div className="stats-grid mb-4">
        {/* KPI 1 */}
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Total Gym Branches</span>
            <Building2 size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="stat-card-value">{metrics?.totalTenants || 0}</p>
          <p className="stat-card-trend up">
            Registered gym tenants
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Active Gyms</span>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="stat-card-value">{metrics?.activeTenants || 0}</p>
          <p className="stat-card-trend up">
            Branches with full access
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Total Members</span>
            <Users size={20} className="text-info" />
          </div>
          <p className="stat-card-value">{metrics?.totalMembers || 0}</p>
          <p className="stat-card-trend up">
            Active client registrations
          </p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Platform Volume</span>
            <IndianRupee size={20} className="text-success" />
          </div>
          <p className="stat-card-value">₹{metrics?.totalRevenue || 0}</p>
          <p className="stat-card-trend up">
            Cumulative transaction flows
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recently Onboarded Gym Branches</h3>
            <button className="btn btn-secondary" onClick={() => navigate('/tenants')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <span>Manage Tenants</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {(!metrics?.recentTenants || metrics.recentTenants.length === 0) ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>
              No branches registered yet. Click "Manage Tenants" to create your first gym tenant.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Gym Name</th>
                    <th>Subdomain Slug</th>
                    <th>Contact Phone</th>
                    <th>Created On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentTenants.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <p style={{ fontWeight: 600 }}>{t.name}</p>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                          {t.slug}
                        </span>
                      </td>
                      <td>{t.phone || '—'}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${t.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {t.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
