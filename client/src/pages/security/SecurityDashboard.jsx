/**
 * Security dashboard: live table of all visitor entries and their approval
 * chain. The "Check-in" action is disabled until the resident approves.
 * @module pages/security/SecurityDashboard
 */
import { useEffect, useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { resolvePhotoUrl } from '../../api/axios';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  'checked-in': 'bg-blue-100 text-blue-700',
  'checked-out': 'bg-gray-100 text-gray-600',
};

export default function SecurityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState('');

  const fetchVisitors = async () => {
    setError('');
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    } catch (err) {
      setError('Failed to load visitors.');
    }
  };

  useEffect(() => {
    fetchVisitors();
    // Poll so resident decisions appear live at the gate.
    const interval = setInterval(fetchVisitors, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const checkIn = async (id) => {
    try {
      await api.patch(`/visitors/${id}/checkin`);
      await fetchVisitors();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    }
  };

  const checkOut = async (id) => {
    try {
      await api.patch(`/visitors/${id}/checkout`);
      await fetchVisitors();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    }
  };

  const counts = {
    pending: visitors.filter((v) => v.status === 'pending').length,
    approved: visitors.filter((v) => v.status === 'approved').length,
    checkedIn: visitors.filter((v) => v.status === 'checked-in').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gate Security Dashboard</h1>
          <p className="text-sm text-gray-500">
            Live approvals: allow entry only after the resident approves.
          </p>
        </div>
        <button
          onClick={() => navigate('/security/entry')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Log Visitor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Waiting Approval</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{counts.pending}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-2">Awaiting resident response</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Approved / Ready</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{counts.approved}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Eligible for check-in</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Currently Inside</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{counts.checkedIn}</h3>
          <p className="text-xs text-blue-600 font-semibold mt-2">Checked-in not yet out</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            <ShieldCheck className="inline w-5 h-5 text-blue-600 mr-1" />
            Visitor Approvals & Status
          </h3>
          <button
            onClick={fetchVisitors}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                <th className="py-3 px-6">Visitor</th>
                <th className="py-3 px-6">Flat</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Response</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No visitors logged yet.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        {visitor.photoUrl ? (
                          <img
                            src={resolvePhotoUrl(visitor.photoUrl)}
                            alt={visitor.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{visitor.name}</p>
                          <p className="text-xs text-gray-500">{visitor.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium text-blue-600">{visitor.flatNumber}</td>
                    <td className="py-3 px-6 text-gray-600">{visitor.purpose}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_STYLE[visitor.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {visitor.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {visitor.status === 'approved' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Resident approved
                        </span>
                      ) : visitor.status === 'rejected' ? (
                        <span className="text-red-600 text-xs font-semibold">Resident rejected</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Waiting&hellip;</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      {visitor.status === 'approved' && (
                        <button
                          onClick={() => checkIn(visitor._id)}
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Allow Check-in</span>
                        </button>
                      )}
                      {visitor.status === 'checked-in' && (
                        <button
                          onClick={() => checkOut(visitor._id)}
                          className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Check-out</span>
                        </button>
                      )}
                      {visitor.status === 'pending' && (
                        <button
                          disabled
                          className="inline-flex items-center space-x-1 bg-gray-200 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
                          title="Awaiting resident approval"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Waiting Approval</span>
                        </button>
                      )}
                      {visitor.status === 'rejected' && (
                        <span className="text-xs text-gray-400">No entry</span>
                      )}
                      {visitor.status === 'checked-out' && (
                        <span className="text-xs text-gray-400">Left premises</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}