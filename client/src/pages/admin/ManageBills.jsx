/**
 * Admin Bill Management: create and issue electricity, water, and maintenance bills with proof.
 * @module pages/admin/ManageBills
 */
import { useEffect, useState } from 'react';
import { Receipt, Plus, CheckCircle2, Clock, Image, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const BILL_TYPES = ['Maintenance', 'Electricity', 'Water', 'Clubhouse', 'Other'];

export default function ManageBills() {
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proofFile, setProofFile] = useState(null);

  const [form, setForm] = useState({
    residentId: '',
    type: BILL_TYPES[0],
    amount: '',
    dueDate: '',
    description: '',
  });

  const fetchData = async () => {
    try {
      const [billsRes, usersRes] = await Promise.all([
        api.get('/bills'),
        api.get('/users'),
      ]);
      setBills(billsRes.data || []);
      setResidents((usersRes.data || []).filter((u) => u.role === 'resident'));
    } catch (err) {
      setError('Failed to fetch billing data.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.residentId) {
      setError('Please select a target resident or All Flats.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('residentId', form.residentId);
    formData.append('resident', form.residentId);
    formData.append('type', form.type);
    formData.append('amount', form.amount);
    formData.append('dueDate', form.dueDate);
    formData.append('description', form.description);
    if (proofFile) {
      formData.append('proof', proofFile);
    }

    try {
      await api.post('/bills', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`Successfully issued ${form.type} bill!`);
      setForm({
        residentId: '',
        type: BILL_TYPES[0],
        amount: '',
        dueDate: '',
        description: '',
      });
      setProofFile(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue bill.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    setError('');
    try {
      await api.delete(`/bills/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Society Billing & Utilities</h1>
        <p className="text-sm text-gray-500">
          Issue electricity, water, and maintenance invoices directly to resident flats.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
          {success}
        </div>
      )}

      {/* Bill Creation Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <span>Generate New Bill</span>
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Resident / Flat</label>
            <select
              value={form.residentId}
              onChange={(e) => setForm({ ...form, residentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              required
            >
              <option value="">Select target...</option>
              <option value="ALL">🏢 All Resident Flats</option>
              {residents.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.flatNumber || r.flat || 'Flat'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bill Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {BILL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Attach Proof (Meter Reading / Receipt)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Description</label>
            <input
              type="text"
              placeholder="e.g. August electricity reading: 210 units"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg text-sm flex items-center space-x-1 h-10 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Issuing...' : 'Issue Bill'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Issued Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Issued Society Invoices</h3>
        {bills.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices have been issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs">
                  <th className="py-3 px-4">FLAT / RESIDENT</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">PROOF</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {bill.flatNumber || 'Flat'} - {bill.resident?.name || bill.user?.name || 'Resident'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bill.type || bill.title}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">₹{bill.amount}</td>
                    <td className="py-3 px-4">
                      {bill.proofUrl ? (
                        <a
                          href={`http://localhost:5000${bill.proofUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <Image className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No file</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {bill.dueDate ? bill.dueDate.split('T')[0] : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          bill.status === 'Paid' || bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bill.status === 'Paid' || bill.status === 'paid' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {bill.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(bill._id)}
                        title="Delete Bill"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}