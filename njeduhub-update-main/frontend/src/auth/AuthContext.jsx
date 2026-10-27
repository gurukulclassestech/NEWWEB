import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BASE = 'https://backend-gurukul.vercel.app';
const API = `${BASE.replace(/\/$/, '')}/api`;
const STORAGE_KEY = 'nj_admin_auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  // Verify token on mount (rejects expired/invalid tokens)
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (auth?.token) {
        try {
          await axios.get(`${API}/admin/me`, { headers: { Authorization: `Bearer ${auth.token}` } });
          if (!cancel) setReady(true);
        } catch {
          if (!cancel) { localStorage.removeItem(STORAGE_KEY); setAuth(null); setReady(true); }
        }
      } else {
        setReady(true);
      }
    })();
    return () => { cancel = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { username, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  const changePassword = useCallback(async (current_password, new_password) => {
    const { data } = await axios.post(`${API}/admin/change-password`, { current_password, new_password }, {
      headers: { Authorization: `Bearer ${auth?.token}` }
    });
    return data;
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, ready, login, logout, changePassword, token: auth?.token, username: auth?.username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { STORAGE_KEY };
