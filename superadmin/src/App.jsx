import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';

// Layout wrapper for super admin
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Overview';
      case '/tenants':
        return 'Branch Directory';
      default:
        return 'Control Center';
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="main-content">
        <Header title={getPageTitle()} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
};

// Route Guard Component
const PrivateRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Securing platform environment...</p>
      </div>
    );
  }

  // Double guard: must have token and role === superadmin
  return (token && user && user.role === 'superadmin') 
    ? <AppLayout>{children}</AppLayout> 
    : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public SuperAdmin login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Management routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tenants" element={<PrivateRoute><Tenants /></PrivateRoute>} />

            {/* Fallback navigation */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
