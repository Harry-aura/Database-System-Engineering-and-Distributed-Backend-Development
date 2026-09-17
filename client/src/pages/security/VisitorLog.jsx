/**
 * Full persistent visitor log for security staff.
 * @module pages/security/VisitorLog
 */
import { useEffect, useState } from 'react';
import { LogOut, List } from 'lucide-react';
import api, { resolvePhotoUrl } from '../../api/axios';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  'checked-in': 'bg-blue-100 text-blue-700',
  'checked-out': 'bg-gray-100 text-gray-600',
};

export default function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchVisitors = async () => {
    setError('');
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/visitors', { params });
      setVisitors(data);
    } catch (err) {
      setError('Failed to load the visitor log.');
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [filter]);

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString() : '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <List className="w-6 h-6 text-blue-600" />
            <span>Visitor Log</span>
          </h1>
          <p className="text-sm text-gray-500">Complete persistent check-in history.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="field !w-auto"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="checked-in">Checked-in</option>
            <option value="checked-out">Checked-out</option>
          </select>
          <button
            onClick={fetchVisitors}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-semibold transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                <th className="py-3 px-6">Visitor</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Flat</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Checked In</th>
                <th className="py-3 px-6">Checked Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No visitor records found.
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
                            className="w-9 h-9 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gray-100 rounded-lg" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{visitor.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Logged by {visitor.guardId?.name || 'Unknown guard'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600">{visitor.phone}</td>
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
                    <td className="py-3 px-6 text-gray-600">{formatDateTime(visitor.checkedInAt)}</td>
                    <td className="py-3 px-6 text-gray-600">
                      {visitor.status === 'checked-out' ? formatDateTime(visitor.checkedOutAt) : (
                        <span className="inline-flex items-center space-x-1 text-gray-400">
                          {visitor.status === 'checked-in' && <LogOut className="w-3.5 h-3.5" />}
                          {visitor.status === 'checked-in' ? 'Inside' : '—'}
                        </span>
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