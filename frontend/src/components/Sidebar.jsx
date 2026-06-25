import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  CalendarCheck,
  CreditCard,
  Receipt,
  BarChart3,
  LogOut,
  Dumbbell,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { tenant, user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Membership Plans', path: '/plans', icon: Award },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container" style={{ flex: 1 }}>
          <Dumbbell className="logo-icon" size={28} />
          <div>
            <h1 className="gym-title">{tenant?.name || 'PowerGym'}</h1>
            <span className="saas-badge" style={{ textTransform: 'capitalize' }}>
              {tenant?.subscriptionPlan ? `${tenant.subscriptionPlan} Plan` : 'SaaS Partner'}
            </span>
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
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
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
