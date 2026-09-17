/**
 * Authentication context.
 * Persists the logged-in user (token + role) to localStorage so the session
 * survives page reloads.
 * @module context/AuthContext
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api, { STORAGE_KEY, API_BASE_URL } from '../api/axios';

const AuthContext = createContext(undefined);

/** Reads the persisted session from localStorage once. */
const readStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Provides auth state and helpers to the whole tree.
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  /**
   * Logs in with email/password and persists the returned user + token.
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  /** Removes the session from state and localStorage. */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  /**
   * Refreshes the profile from /api/auth/me (keeps token in sync).
   */
  const refreshProfile = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    const current = readStoredUser();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setUser(merged);
    return merged;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshProfile }),
    [user, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Convenience hook to read auth context.
 * @returns {{ user: object|null, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { API_BASE_URL };