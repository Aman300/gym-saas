import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

// Layout wrapper for authenticated users
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  // Helper to determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Gym Dashboard';
      case '/members':
        return 'Members Directory';
      case '/plans':
        return 'Membership Schemes';
      case '/attendance':
        return 'Daily Attendance Log';
      case '/payments':
        return 'Billing Transactions';
      case '/expenses':
        return 'Operations Expense Registry';
      case '/reports':
        return 'Analytics & Data Intelligence';
      default:
        return 'Gym Manager';
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
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Verifying credentials...</p>
      </div>
    );
  }

  return token ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected SaaS routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><Plans /></PrivateRoute>} />
            <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
