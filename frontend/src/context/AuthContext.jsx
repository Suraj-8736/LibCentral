import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe, loginWithOtp as loginWithOtpService, logoutUser, sendHeartbeat } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and load fresh user on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const data = await getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Heartbeat & Tab Close / Cut Beacon Disconnect
  useEffect(() => {
    if (!token || !user) return;

    // Send immediate heartbeat on mount
    sendHeartbeat();

    // Periodic heartbeat every 30 seconds
    const interval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    const handleUnload = () => {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const disconnectUrl = `${apiUrl}/auth/disconnect`;
      const payload = JSON.stringify({ token });
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(disconnectUrl, blob);
      } else {
        fetch(disconnectUrl, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [token, user]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  };

  const loginWithOtp = async (email, otp) => {
    const data = await loginWithOtpService(email, otp);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    logoutUser().catch((err) => console.error('Error logging out:', err));
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const isAdmin = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian';
  const isStaff = isAdmin || isLibrarian;
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin,
        isLibrarian,
        isStaff,
        isStudent,
        login,
        loginWithOtp,
        register,
        logout,
        updateUser,
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
