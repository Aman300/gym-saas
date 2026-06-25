import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setErrorMsg(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Sidebar Splash section */}
      <div className="auth-sidebar" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' }}>
        <div className="auth-sidebar-content">
          <div className="auth-logo">
            <ShieldCheck size={42} style={{ color: 'var(--primary-light)' }} />
            <span>SuperAdmin Panel</span>
          </div>
          <p className="auth-tagline">
            Global management dashboard to review system analytics, spin up new gym tenant branches, configure status suspensions, and administer the Gym SaaS infrastructure.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Register new gym branch tenants</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Suspend / Activate tenant accounts</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Review aggregated global revenue & membership metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login form */}
      <main className="auth-main">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h2 className="auth-title">System Control</h2>
            <p className="auth-subtitle">Log in to administer SaaS infrastructure</p>
          </div>

          {errorMsg && (
            <div className="auth-error flex-align-center">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">SuperAdmin Email</label>
              <input
                className="form-input"
                type="email"
                id="email"
                placeholder="superadmin@gym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                className="form-input"
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authorizing Access...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
