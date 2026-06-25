import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar, Search, LogOut, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Checking in code states
  const [code, setCode] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  const fetchAttendanceLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance?date=${selectedDate}`);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, [selectedDate]);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setScanLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/attendance/scan', { memberCode: code.trim() });
      if (res.success) {
        setStatusMsg({
          type: 'success',
          message: res.message
        });
        setCode('');
        fetchAttendanceLogs();
      } else {
        setStatusMsg({
          type: 'error',
          message: res.message || 'Verification error'
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        message: 'Server connection error'
      });
    } finally {
      setScanLoading(false);
    }
  };

  const forceCheckout = async (memberCode) => {
    try {
      const res = await api.post('/attendance/scan', { memberCode });
      if (res.success) {
        fetchAttendanceLogs();
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Attendance Logging</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Register and review check-in sessions of your athletes</p>
        </div>
      </div>

      <div className="grid-2 mb-4" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
        {/* Terminal Input */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1rem', fontWeight: 700 }}>Desk Check-In Terminal</h3>
          <form onSubmit={handleScanSubmit}>
            <div className="form-group">
              <label className="form-label">Member Identification Code</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. GYM-100293"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={scanLoading}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={scanLoading}>
              {scanLoading ? 'Checking...' : 'Submit Entry'}
            </button>
          </form>

          {statusMsg && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: statusMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${statusMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: statusMsg.type === 'success' ? 'var(--text-primary)' : 'var(--danger)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {statusMsg.message}
            </div>
          )}
        </div>

        {/* Date Filter & Info Summary */}
        <div className="glass-card flex-between" style={{ height: 'fit-content', padding: '1.5rem' }}>
          <div style={{ width: '100%' }}>
            <h3 className="mb-3" style={{ fontSize: '1rem', fontWeight: 700 }}>Filter By Date</h3>
            <div className="flex-align-center form-group" style={{ marginBottom: 0 }}>
              <Calendar size={18} className="text-secondary" />
              <input
                className="form-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Member Code</th>
              <th>Check-In Time</th>
              <th>Check-Out Time</th>
              <th>Plan Type</th>
              <th>Session Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                  No attendance records logged for {new Date(selectedDate).toLocaleDateString()}.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isExpired = log.memberId?.membershipEnd && new Date(log.memberId.membershipEnd) < new Date();
                return (
                  <tr key={log._id}>
                    <td>
                      <p style={{ fontWeight: 600 }}>{log.memberId?.name || 'Deleted Member'}</p>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.memberId?.memberCode}</td>
                    <td>{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      {log.checkOut ? (
                        new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>Inside Gym</span>
                      )}
                    </td>
                    <td>{log.memberId?.planId?.name || 'N/A'}</td>
                    <td>
                      <div className="flex-align-center" style={{ gap: '0.25rem' }}>
                        {isExpired ? (
                          <span className="badge badge-danger flex-align-center" style={{ gap: '0.25rem' }}>
                            <AlertTriangle size={12} /> Expired Plan
                          </span>
                        ) : log.checkOut ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-info">Active Gym Session</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!log.checkOut && log.memberId?.memberCode && (
                        <button
                          className="btn btn-secondary flex-align-center"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => forceCheckout(log.memberId.memberCode)}
                        >
                          <LogOut size={12} /> Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
