/**
 * Admin dashboard with live counters computed from MongoDB.
 * @module pages/admin/AdminDashboard
 */
import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, Receipt, Megaphone } from 'lucide-react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    residents: 0,
    pendingVisitors: 0,
    pendingBills: 0,
    notices: 0,
  });

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const [usersRes, visitorsRes, billsRes, noticesRes] = await Promise.all([
          api.get('/users'),
          api.get('/visitors'),
          api.get('/bills'),
          api.get('/notices'),
        ]);

        if (!active) return;

        setStats({
          residents: usersRes.data.filter((u) => u.role === 'resident').length,
          pendingVisitors: visitorsRes.data.filter((v) => v.status === 'pending').length,
          pendingBills: billsRes.data.filter((b) => b.status === 'pending').length,
          notices: noticesRes.data.length,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const cards = [
    { label: 'Registered Residents', value: stats.residents, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Visitor Approvals', value: stats.pendingVisitors, icon: ClipboardCheck, color: 'bg-amber-100 text-amber-600' },
    { label: 'Pending Maintenance Bills', value: stats.pendingBills, icon: Receipt, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Published Notices', value: stats.notices, icon: Megaphone, color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Live society statistics read from MongoDB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}