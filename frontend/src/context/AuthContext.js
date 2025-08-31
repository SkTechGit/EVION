// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

/**
 * Safe JWT decoding without external packages.
 * Returns payload object or null on error.
 */
function safeDecodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    // invalid token or decode failure
    return null;
  }
}

/**
 * AuthProvider — exposes:
 *  - token, user (decoded payload), userRole, userId, isAuthenticated
 *  - login(tokenString), logout()
 */
export const AuthProvider = ({ children }) => {
  // read token once at startup
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(() => {
    const payload = safeDecodeJwt(initialToken);
    if (!payload) return null;
    // If token has exp and is expired, clear it
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return payload;
  });

  // Sync token -> decoded user and localStorage
  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('token');
      return;
    }

    const payload = safeDecodeJwt(token);
    if (!payload) {
      // invalid token: clear
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // expired
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return;
    }

    setUser(payload);
    localStorage.setItem('token', token);
  }, [token]);

  // Keep token in sync across tabs (storage event)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Login accepts a raw token string (returned by your backend)
  const login = (newToken) => {
    const payload = safeDecodeJwt(newToken);
    if (!payload) throw new Error('Invalid token');
    if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expired');
    setToken(newToken);
    // user will be set by effect above
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Handy derived values for consumers (avoid re-decoding)
  const userRole = user?.role ?? user?.user?.role ?? (user?.isAdmin ? 'admin' : null) ?? null;
  const userId = user?._id ?? user?.userId ?? user?.id ?? null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ token, user, userRole, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
