import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Calendar, Menu } from 'lucide-react';

export const Header = ({ title, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const getTodayDateString = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={toggleSidebar}
          className="menu-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-title-section">
          <h2 className="header-title">{title}</h2>
          <div className="header-date">
            <Calendar size={16} />
            <span>{getTodayDateString()}</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="header-divider"></div>

        <div className="user-profile">
          <span className="welcome-text">Hello, {user?.name.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
