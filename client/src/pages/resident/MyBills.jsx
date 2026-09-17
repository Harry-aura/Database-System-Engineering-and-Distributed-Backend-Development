/**
 * Resident bills: list maintenance dues, pay them, and remove paid receipts.
 * @module pages/resident/MyBills
 */
import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function MyBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchBills = async () => {
    setError('');
    try {
      const { data } = await api.get('/bills', {
        params: { flatNumber: user.flatNumber },
      });
      setBills(data);
    } catch (err) {
      setError('Failed to load bills.');
    }
  };

  useEffect(() => {
    fetchBills();
  }, [user]);

  const payBill = async (id) => {
    setProcessingId(id);
    setError('');
    try {
      await api.put(`/bills/${id}`);
      await fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this paid invoice record?')) return;
    setError('');
    try {
      await api.delete(`/bills/${id}`);
      await fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill.');
    }
  };

  const outstanding = bills
    .filter((b) => b.status === 'pending')
    .reduce((acc, b) => acc + b.amount, 0);
  const pendingCount = bills.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Bills & Maintenance Dues</h1>
        <p className="text-sm text-gray-500">
          Outstanding charges for Flat {user.flatNumber}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Total Outstanding</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">
            ₹{outstanding.toLocaleString()}
          </h3>
          <p className="text-xs text-amber-600 font-semibold mt-2">
            {pendingCount} bill(s) pending
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Bills Paid</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">
            {bills.filter((b) => b.status === 'paid').length}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-2">
            Fully settled
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Payment Method</p>
          <h3 className="text-lg font-bold text-gray-800 mt-2 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>UPI / Cards / NetBanking</span>
          </h3>
          <p className="text-xs text-blue-600 font-semibold mt-2">Saved to MongoDB</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Invoices & Dues History</h3>
          <button
            onClick={fetchBills}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Proof</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold text-gray-800">{bill.title}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">₹{bill.amount.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {bill.proofUrl ? (
                        <a
                          href={`http://localhost:5000${bill.proofUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No proof</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {bill.status === 'pending' ? (
                          <button
                            onClick={() => payBill(bill._id)}
                            disabled={processingId === bill._id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            {processingId === bill._id ? 'Paying…' : 'Pay Now'}
                          </button>
                        ) : (
                          <>
                            <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                Paid {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : ''}
                              </span>
                            </span>
                            <button
                              onClick={() => handleDelete(bill._id)}
                              title="Delete paid receipt"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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