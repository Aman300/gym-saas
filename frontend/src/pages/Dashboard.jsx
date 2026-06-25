import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Receipt,
  Sparkles,
  IndianRupee,
  UserCheck,
  UserPlus,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Award
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      if (res.success) {
        setMetrics(res.data.metrics);
        setRecentMembers(res.data.recentMembers);
        setRecentPayments(res.data.recentPayments);
        setRecentCheckIns(res.data.recentCheckIns);
      }
    } catch (err) {
      console.error('Error fetching dashboard reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    setScanLoading(true);
    setScanResult(null);

    try {
      const res = await api.post('/attendance/scan', { memberCode: scanCode.trim() });
      if (res.success) {
        setScanResult({
          type: 'success',
          action: res.action,
          message: res.message,
          member: res.member,
          isExpired: res.isExpired
        });
        setScanCode('');
        // Refresh dashboard numbers
        fetchDashboardData();
      } else {
        setScanResult({
          type: 'error',
          message: res.message || 'Check-in failed.'
        });
      }
    } catch (err) {
      setScanResult({
        type: 'error',
        message: 'Unable to connect to server.'
      });
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        {/* Title skeleton */}
        <div className="flex-between mb-4">
          <div>
            <div className="skeleton skeleton-title" style={{ height: '2.25rem', width: '250px', borderRadius: '8px' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '1.25rem', width: '180px', marginTop: '0.5rem', borderRadius: '4px' }}></div>
          </div>
        </div>

        {/* Quick Actions & Scan Terminal skeleton */}
        <div className="dashboard-widget-grid mb-4" style={{ pointerEvents: 'none' }}>
          {/* Quick Actions Card skeleton */}
          <div className="glass-card">
            <div className="flex-align-center mb-3">
              <div className="skeleton skeleton-circle" style={{ width: '22px', height: '22px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '130px', height: '1.25rem', marginBottom: 0 }}></div>
            </div>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '1rem', marginBottom: '1.25rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="skeleton skeleton-rect" style={{ height: '2.5rem' }}></div>
              <div className="skeleton skeleton-rect" style={{ height: '2.5rem' }}></div>
              <div className="skeleton skeleton-rect" style={{ height: '2.5rem' }}></div>
              <div className="skeleton skeleton-rect" style={{ height: '2.5rem' }}></div>
              <div className="skeleton skeleton-rect" style={{ height: '2.5rem', gridColumn: 'span 2' }}></div>
            </div>
          </div>

          {/* Smart Scan Terminal Card skeleton */}
          <div className="glass-card">
            <div className="flex-align-center mb-3">
              <div className="skeleton skeleton-circle" style={{ width: '22px', height: '22px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '150px', height: '1.25rem', marginBottom: 0 }}></div>
            </div>
            <div className="skeleton skeleton-text" style={{ width: '80%', height: '1rem', marginBottom: '1.25rem' }}></div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              <div className="skeleton skeleton-rect" style={{ flex: 1, height: '2.5rem' }}></div>
              <div className="skeleton skeleton-rect" style={{ width: '100px', height: '2.5rem' }}></div>
            </div>
          </div>
        </div>

        {/* Metrics Grid skeleton */}
        <div className="stats-grid">
          {[1, 2, 3, 4].map((idx) => (
            <div className="glass-card" key={idx} style={{ pointerEvents: 'none' }}>
              <div className="flex-between mb-3" style={{ alignItems: 'flex-start' }}>
                <div className="skeleton skeleton-text" style={{ width: '110px', height: '1rem', marginBottom: 0 }}></div>
                <div className="skeleton skeleton-rect" style={{ width: '42px', height: '42px' }}></div>
              </div>
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '2.25rem', marginBottom: '0.75rem' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '0.75rem', marginBottom: 0 }}></div>
            </div>
          ))}
        </div>

        {/* Grid-2 skeleton */}
        <div className="grid-2">
          <div className="glass-card" style={{ pointerEvents: 'none' }}>
            <div className="skeleton skeleton-title" style={{ width: '180px', height: '1.25rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-align-center" style={{ gap: '0.75rem' }}>
                    <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                    <div>
                      <div className="skeleton skeleton-text" style={{ width: '120px', height: '0.85rem' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80px', height: '0.75rem' }}></div>
                    </div>
                  </div>
                  <div className="skeleton skeleton-text" style={{ width: '50px', height: '0.85rem' }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ pointerEvents: 'none' }}>
            <div className="skeleton skeleton-title" style={{ width: '150px', height: '1.25rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-align-center" style={{ gap: '0.75rem' }}>
                    <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                    <div>
                      <div className="skeleton skeleton-text" style={{ width: '120px', height: '0.85rem' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80px', height: '0.75rem' }}></div>
                    </div>
                  </div>
                  <div className="skeleton skeleton-text" style={{ width: '60px', height: '1.25rem' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Real-time state of your gym operations</p>
        </div>
      </div>

      {/* Quick Actions & Scan Widget */}
      <div className="dashboard-widget-grid mb-4">
        {/* Quick Actions Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="flex-align-center mb-3">
            <Sparkles className="text-primary" size={22} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Quick Actions</h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Fast-track common management workflows in one click.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flex: 1 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/members?action=add')} style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.825rem' }}>
              <UserPlus size={16} className="text-primary" />
              <span>Add Member</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/payments?action=new')} style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.825rem' }}>
              <CreditCard size={16} className="text-success" />
              <span>New Payment</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/plans?action=new')} style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.825rem' }}>
              <Award size={16} className="text-warning" />
              <span>Create Plan</span>
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                const inputEl = document.getElementById('scan-terminal-input');
                if (inputEl) {
                  inputEl.focus();
                  inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }} 
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.825rem' }}
            >
              <QrCode size={16} className="text-info" />
              <span>Scan QR</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/reports')} style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.825rem', gridColumn: 'span 2' }}>
              <TrendingUp size={16} className="text-primary" />
              <span>Export Analytics Report</span>
            </button>
          </div>
        </div>

        {/* Smart Scan Terminal Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
          <div className="flex-align-center mb-3">
            <QrCode className="text-success" size={22} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Smart Scan Terminal</h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Enter a Member Code manually or scan to record check-in/out.
          </p>
          
          <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', width: '100%' }}>
            <input
              id="scan-terminal-input"
              className="form-input"
              style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', flex: 1 }}
              type="text"
              placeholder="e.g. GYM-623846"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              disabled={scanLoading}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={scanLoading} style={{ padding: '0.75rem 1.25rem' }}>
              {scanLoading ? 'Scanning...' : 'Check-in'}
            </button>
          </form>

          {scanResult && (
            <div
              className="mb-0"
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: scanResult.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: scanResult.type === 'success' ? 'var(--text-primary)' : 'var(--danger)',
                animation: 'fadeIn var(--transition-fast) forwards'
              }}
            >
              <div className="flex-between">
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{scanResult.message}</p>
                  {scanResult.member && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Plan: {scanResult.member.planId?.name} | Expiry: {new Date(scanResult.member.membershipEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {scanResult.isExpired && (
                  <span className="badge badge-danger flex-align-center" style={{ gap: '0.25rem', fontSize: '0.65rem' }}>
                    <AlertTriangle size={10} /> Expired
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Active Members</span>
            <div className="icon-badge icon-badge-success">
              <Users size={20} />
            </div>
          </div>
          <p className="stat-card-value">{metrics?.activeMembers || 0}</p>
          <p className="stat-card-trend up">
            <ArrowUpRight size={14} />
            <span>+15% this month</span>
          </p>
        </div>

        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Today's Check-ins</span>
            <div className="icon-badge icon-badge-info">
              <CalendarCheck size={20} />
            </div>
          </div>
          <p className="stat-card-value">{metrics?.todayCheckIns || 0}</p>
          <p className="stat-card-trend up">
            <ArrowUpRight size={14} />
            <span>+5 vs yesterday</span>
          </p>
        </div>

        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Monthly Revenue</span>
            <div className="icon-badge icon-badge-primary">
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="stat-card-value">₹{(metrics?.monthlyRevenue || 0).toLocaleString('en-IN')}</p>
          <p className="stat-card-trend up">
            <ArrowUpRight size={14} />
            <span>+12%</span>
          </p>
        </div>

        <div
          className="glass-card"
          onClick={() => navigate('/members?filter=expired')}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex-between">
            <span className="stat-card-label">Expiring Soon</span>
            <div className="icon-badge icon-badge-warning">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="stat-card-value text-danger">{metrics?.expiringSoon || 0}</p>
          <p className="stat-card-trend warning">
            <ArrowDownRight size={14} style={{ color: 'var(--warning)' }} />
            <span>Next 7 days</span>
          </p>
        </div>
      </div>

      {/* Recent activities layout */}
      <div className="grid-2">
        {/* Recent Check-Ins */}
        <div className="glass-card">
          <h3 className="mb-4" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Today's Check-in Log</h3>
          {recentCheckIns.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>
              No check-ins registered today yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentCheckIns.map((log) => (
                <div key={log._id} className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-align-center">
                    <UserCheck className="text-info" size={18} />
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{log.memberId?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Code: {log.memberId?.memberCode}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="glass-card">
          <h3 className="mb-4" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>
              No payments recorded yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentPayments.map((pay) => (
                <div key={pay._id} className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-align-center">
                    <TrendingUp className="text-success" size={18} />
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pay.memberId?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Plan: {pay.planId?.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>+₹{pay.amount}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{pay.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
