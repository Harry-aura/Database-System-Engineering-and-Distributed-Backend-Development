/**
 * Role-based sidebar navigation.
 * @module components/Sidebar
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Home,
  ClipboardCheck,
  CreditCard,
  Calendar,
  ShieldCheck,
  LogIn,
  List,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/bills', icon: Receipt, label: 'Manage Bills' },
    { to: '/admin/notices', icon: Megaphone, label: 'Society Notices' },
  ],
  resident: [
    { to: '/resident', icon: Home, label: 'Dashboard' },
    { to: '/resident/visitor-approvals', icon: ClipboardCheck, label: 'Visitor Approvals' },
    { to: '/resident/bills', icon: CreditCard, label: 'My Bills' },
    { to: '/resident/bookings', icon: Calendar, label: 'Book Amenities' },
  ],
  security: [
    { to: '/security', icon: ShieldCheck, label: 'Dashboard' },
    { to: '/security/entry', icon: LogIn, label: 'Visitor Entry' },
    { to: '/security/log', icon: List, label: 'Visitor Log' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = LINKS[user?.role] || [];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col border-r border-gray-800 shrink-0 hidden md:flex">
      <div className="p-4 border-b border-gray-800">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3">
          Navigation ({user?.role})
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/resident' || link.to === '/security'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Harmony Towers v2.0
      </div>
    </aside>
  );
}