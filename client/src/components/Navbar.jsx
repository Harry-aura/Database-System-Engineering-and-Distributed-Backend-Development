/**
 * Top navigation bar: brand, notification bell, user chip, logout.
 * @module components/Navbar
 */
import { Building2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">Harmony Towers</h1>
          <p className="text-xs text-gray-500">Society Management Portal</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationBell />
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-600 font-medium capitalize">
              {user?.role}
              {user?.flatNumber ? ` (Flat ${user.flatNumber})` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}