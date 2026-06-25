import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ShieldAlert, Award, Sparkles, CheckCircle2 } from 'lucide-react';

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
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-logo">
            <Dumbbell size={42} />
            <span>Antigravity FIT</span>
          </div>
          <p className="auth-tagline">
            The ultimate SaaS platform for gym owners, enabling real-time attendance, smooth payment tracking, and deep financial reports.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Multi-tenant isolation & security</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Live dashboard analytics</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={18} className="auth-feature-icon" />
              <span>Automated billing & attendance scanner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login form */}
      <main className="auth-main">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Log in to manage your gym operations</p>
          </div>

          {errorMsg && (
            <div className="auth-error flex-align-center">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                className="form-input"
                type="email"
                id="email"
                placeholder="owner@mygym.com"
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have a gym registered?{' '}
              <Link to="/register" className="auth-link">
                Register Gym (SaaS Setup)
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
