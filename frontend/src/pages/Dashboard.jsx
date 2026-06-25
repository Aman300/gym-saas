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
  QrCode
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Loading Dashboard analytics...</p>
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

      {/* Quick Attendance Check-in Widget */}
      <div className="glass-card mb-4" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
        <div className="flex-align-center mb-3">
          <QrCode className="text-success" size={24} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Smart Scan Terminal</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Enter a Member Code to instantly record their Attendance check-in or check-out.
        </p>
        
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px' }}>
          <input
            className="form-input"
            style={{ fontSize: '1rem', padding: '0.85rem 1.25rem' }}
            type="text"
            placeholder="e.g. GYM-623846"
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            disabled={scanLoading}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={scanLoading}>
            {scanLoading ? 'Scanning...' : 'Scan / Check-in'}
          </button>
        </form>

        {scanResult && (
          <div
            className="mb-3"
            style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: scanResult.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              border: `1px solid ${scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: scanResult.type === 'success' ? 'var(--text-primary)' : 'var(--danger)',
              animation: 'fadeIn var(--transition-fast) forwards'
            }}
          >
            <div className="flex-between">
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{scanResult.message}</p>
                {scanResult.member && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Plan: {scanResult.member.planId?.name} | Expiry: {new Date(scanResult.member.membershipEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {scanResult.isExpired && (
                <span className="badge badge-danger flex-align-center" style={{ gap: '0.25rem' }}>
                  <AlertTriangle size={12} /> Expired
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Active Members</span>
            <Users size={20} className="text-success" />
          </div>
          <p className="stat-card-value">{metrics?.activeMembers || 0}</p>
          <p className="stat-card-trend up">
            Out of {metrics?.totalMembers || 0} registered
          </p>
        </div>

        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Today's Check-ins</span>
            <CalendarCheck size={20} className="text-info" />
          </div>
          <p className="stat-card-value">{metrics?.todayCheckIns || 0}</p>
          <p className="stat-card-trend up">
            Active attendees today
          </p>
        </div>

        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Monthly Revenue</span>
            <IndianRupee size={20} className="text-success" />
          </div>
          <p className="stat-card-value">₹{metrics?.monthlyRevenue || 0}</p>
          <p className="stat-card-trend up">
            Current calendar month
          </p>
        </div>

        <div className="glass-card">
          <div className="flex-between">
            <span className="stat-card-label">Monthly Expenses</span>
            <Receipt size={20} className="text-danger" />
          </div>
          <p className="stat-card-value">₹{metrics?.monthlyExpenses || 0}</p>
          <p className="stat-card-trend down">
            Cash outgoings
          </p>
        </div>

        <div
          className="glass-card"
          onClick={() => navigate('/members?filter=expired')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--danger)' }}
        >
          <div className="flex-between">
            <span className="stat-card-label">Expired Memberships</span>
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <p className="stat-card-value text-danger">{metrics?.expiredCount || 0}</p>
          <p className="stat-card-trend down" style={{ color: 'var(--text-secondary)' }}>
            Click to renew members
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
