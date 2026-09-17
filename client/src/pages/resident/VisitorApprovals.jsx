/**
 * Resident visitor approvals: live pending cards with photo and
 * instant Approve / Reject actions.
 * @module pages/resident/VisitorApprovals
 */
import { useEffect, useState } from 'react';
import { Check, X, UserRound, Phone, MapPin, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { resolvePhotoUrl } from '../../api/axios';

const STATUS_STYLE = {
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  'checked-in': 'bg-blue-100 text-blue-700',
  'checked-out': 'bg-gray-100 text-gray-600',
};

export default function VisitorApprovals() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setError('');
    try {
      const [pendingRes, logRes] = await Promise.all([
        api.get('/visitors/pending', { params: { flatNumber: user.flatNumber } }),
        api.get('/visitors', { params: { flatNumber: user.flatNumber } }),
      ]);
      setPending(pendingRes.data);
      setHistory(logRes.data.filter((v) => v.status !== 'pending'));
    } catch (err) {
      setError('Failed to load visitor requests.');
    }
  };

  useEffect(() => {
    fetchData();
    // Poll so new gate entries appear without a manual refresh.
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const decide = async (id, status) => {
    try {
      await api.patch(`/visitors/${id}/status`, { status });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update visitor status.');
    }
  };

  const renderPhoto = (visitor) =>
    visitor.photoUrl ? (
      <img
        src={resolvePhotoUrl(visitor.photoUrl)}
        alt={visitor.name}
        className="w-16 h-16 object-cover rounded-xl border border-gray-200"
      />
    ) : (
      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        <UserRound className="w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Visitor Approvals</h1>
        <p className="text-sm text-gray-500">
          Approve or reject visitors who are waiting at the gate for Flat {user.flatNumber}.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Pending approvals */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          <span>Pending Approvals ({pending.length})</span>
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 py-3">
            No visitors waiting for approval right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((visitor) => (
              <div
                key={visitor._id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex space-x-3 mb-3">
                  {renderPhoto(visitor)}
                  <div>
                    <h4 className="font-bold text-gray-800">{visitor.name}</h4>
                    <p className="text-xs text-gray-600 flex items-center space-x-1 mt-1">
                      <Phone className="w-3 h-3" /> <span>{visitor.phone}</span>
                    </p>
                    <p className="text-xs text-gray-600 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> <span>Flat {visitor.flatNumber}</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 mb-3">
                  <strong>Purpose:</strong> {visitor.purpose}
                </p>
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => decide(visitor._id, 'approved')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => decide(visitor._id, 'rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent decisions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                <th className="py-3 px-6">Visitor</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No resolved visitor requests yet.
                  </td>
                </tr>
              ) : (
                history.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        {renderPhoto(visitor)}
                        <span className="font-semibold text-gray-800">{visitor.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600">{visitor.phone}</td>
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