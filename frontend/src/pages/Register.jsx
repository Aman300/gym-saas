import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const [gymName, setGymName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymName || !name || !email || !password || !phone) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await register(gymName, name, email, password, address, phone);
      if (result.success) {
        navigate('/');
      } else {
        setErrorMsg(result.message || 'Registration failed. Try a different email.');
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
            Launch your Gym SaaS branch in less than 60 seconds. Set up your plans, members, and start tracking immediately.
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

      {/* Main Registration form */}
      <main className="auth-main" style={{ padding: '3rem 2rem' }}>
        <div className="auth-card glass-card" style={{ maxWidth: '480px' }}>
          <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
            <h2 className="auth-title">Register Your Gym</h2>
            <p className="auth-subtitle">Create a brand-new tenant account for your fitness center</p>
          </div>

          {errorMsg && (
            <div className="auth-error flex-align-center">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h4 style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gym Profile Details</h4>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="gymName">Gym / Club Name *</label>
                <input
                  className="form-input"
                  type="text"
                  id="gymName"
                  placeholder="Iron Gym Corp"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gymPhone">Gym Phone *</label>
                <input
                  className="form-input"
                  type="text"
                  id="gymPhone"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gymAddress">Gym Location Address</label>
              <input
                className="form-input"
                type="text"
                id="gymAddress"
                placeholder="123 Fitness Ave, Suite 100"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem 0', opacity: 0.8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Account Credentials</h4>

            <div className="form-group">
              <label className="form-label" htmlFor="ownerName">Owner Full Name *</label>
              <input
                className="form-input"
                type="text"
                id="ownerName"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="ownerEmail">Owner Email *</label>
                <input
                  className="form-input"
                  type="email"
                  id="ownerEmail"
                  placeholder="john@irongym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ownerPassword">Password *</label>
                <input
                  className="form-input"
                  type="password"
                  id="ownerPassword"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Tenant System...' : 'Launch Gym Platform'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already registered your gym?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
