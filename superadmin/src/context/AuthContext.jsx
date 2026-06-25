import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gym-superadmin-token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.PROD
    ? 'https://gymapi.chakanroad.fun/api'
    : 'http://localhost:5050/api';

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success && data.user && data.user.role === 'superadmin') {
          setUser(data.user);
        } else {
          // Not authorized or not a superadmin
          logout();
        }
      } catch (err) {
        console.error('Error loading user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.user && data.user.role === 'superadmin') {
          localStorage.setItem('gym-superadmin-token', data.token);
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        } else {
          setError('Access denied: You must be a Super Admin to access this panel.');
          return { success: false, message: 'Access denied: Super Admin role required' };
        }
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, message: 'Connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('gym-superadmin-token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        apiUrl: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
