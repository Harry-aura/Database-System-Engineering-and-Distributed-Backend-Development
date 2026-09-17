/**
 * Login page with quick demo access for the three seeded roles.
 * All logins hit the real backend; no mock fallbacks.
 * @module pages/auth/Login
 */
import { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';

const DEMO_ACCOUNTS = {
  admin: { email: 'admin@society.com', password: 'Admin@123', role: 'admin' },
  resident: { email: 'resident@society.com', password: 'Resident@123', role: 'resident' },
  security: { email: 'guard@society.com', password: 'Guard@123', role: 'security' },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'security') navigate('/security');
    else navigate('/resident');
  };

  const performLogin = async (mail, pass) => {
    setLoading(true);
    setError('');
    try {
      const data = await login(mail, pass);
      redirectByRole(data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (!account) return;
    await performLogin(account.email, account.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="mx-auto bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Harmony Towers</h2>
          <p className="text-blue-100 text-sm mt-1">
            Smart Apartment Society Management System
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Instant Demo Access
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center justify-center p-3 border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition text-center group"
              >
                <KeyRound className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-800">Admin</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('resident')}
                className="flex flex-col items-center justify-center p-3 border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition text-center group"
              >
                <User className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-800">Resident</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('security')}
                className="flex flex-col items-center justify-center p-3 border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition text-center group"
              >
                <ShieldCheck className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-800">Security</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">
              Or log in with credentials
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="user@society.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing in…' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-4 text-[11px] text-center text-gray-400">
            Backend: {API_BASE_URL}
          </p>
        </div>
      </div>
    </div>
  );
}