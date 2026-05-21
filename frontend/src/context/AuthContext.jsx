import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, role = 'user', contactPhone = '') => {
    console.log('AuthContext Register Args:', { name, email, password: '***', role, contactPhone });
    const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role, contactPhone });
    if (data.status === 'active') {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
