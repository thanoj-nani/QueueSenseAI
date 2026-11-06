import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('queuesense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('queuesense_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
          localStorage.setItem('queuesense_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Failed to verify existing session:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('queuesense_token', access_token);
    localStorage.setItem('queuesense_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (email, password, full_name, phone, role = 'user') => {
    const res = await api.post('/api/auth/register', {
      email,
      password,
      full_name,
      phone,
      role
    });
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('queuesense_token', access_token);
    localStorage.setItem('queuesense_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('queuesense_token');
    localStorage.removeItem('queuesense_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
