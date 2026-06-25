import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  LogOut,
  ShieldAlert,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Gym Branches', path: '/tenants', icon: Building2 },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container" style={{ flex: 1 }}>
          <ShieldAlert className="logo-icon" size={28} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className="gym-title">SuperAdmin</h1>
            <span className="saas-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Control Panel</span>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar" style={{ background: 'var(--primary)', color: '#fff' }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'System Admin'}</p>
            <p className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role || 'Super Admin'}</p>
          </div>
        </div>
        <button onClick={() => { onClose(); logout(); }} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
