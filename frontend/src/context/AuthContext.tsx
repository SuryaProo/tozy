import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: AuthUser | null;
  isLoginOpen: boolean;
  authLoading: boolean;       // true while checking existing session on app load
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  requestOtp: (phone: string) => Promise<{ ok: boolean; error?: string; devOtp?: string }>;
  verifyOtp: (phone: string, code: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  openLogin: () => void;
  closeLogin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]             = useState<AuthUser | null>(null);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // On app mount, check if a valid session cookie already exists (auto-login)
  useEffect(() => {
    (async () => {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      }
      setAuthLoading(false);
    })();
  }, []);

  // ── Email + password ──
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.user) {
      setUser(res.user);
      setLoginOpen(false);
      return { ok: true };
    }
    return { ok: false, error: res.message || 'Invalid email or password.' };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.success && res.user) {
      setUser(res.user);
      setLoginOpen(false);
      return { ok: true };
    }
    return { ok: false, error: res.message || 'Registration failed.' };
  }, []);

  // ── Mobile + OTP ──
  const requestOtp = useCallback(async (phone: string) => {
    const res = await api.post('/auth/otp/request', { phone });
    if (res.success) {
      return { ok: true, devOtp: res.devOtp as string | undefined };
    }
    return { ok: false, error: res.message || 'Failed to send OTP.' };
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string, name?: string) => {
    const res = await api.post('/auth/otp/verify', { phone, code, name });
    if (res.success && res.user) {
      setUser(res.user);
      setLoginOpen(false);
      return { ok: true };
    }
    return { ok: false, error: res.message || 'Invalid OTP.' };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await api.post('/auth/logout');
  }, []);

  const openLogin  = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <AuthContext.Provider value={{
      user, isLoginOpen, authLoading,
      login, register, requestOtp, verifyOtp, logout,
      openLogin, closeLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
