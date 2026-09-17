/**
 * Resident dashboard: welcome banner, live pending approvals, and snapshot
 * of bills, notices, and bookings — all loaded from MongoDB.
 * @module pages/resident/ResidentDashboard
 */
import { useEffect, useState } from 'react';
import { ClipboardCheck, CreditCard, Megaphone, CalendarDays, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const [bills, setBills] = useState([]);
  const [notices, setNotices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showNotices, setShowNotices] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchSnapshot = async () => {
      try {
        const visitorsRes = await api.get('/visitors/pending', {
          params: { flatNumber: user.flatNumber },
        });
        const billsRes = await api.get('/bills', {
          params: { flatNumber: user.flatNumber },
        });
        const noticesRes = await api.get('/notices');
        const bookingsRes = await api.get('/bookings');

        if (!active) return;
        setPendingCount(visitorsRes.data.length);
        setBills(billsRes.data);
        setNotices(noticesRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to load resident snapshot:', err);
      }
    };

    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  const pendingBill = bills.find((b) => b.status === 'pending');
  const latestNotice = notices[0];
  const activeBooking = bookings.find((b) => b.status === 'Confirmed');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Resident Portal
          </span>
          <h1 className="text-3xl font-bold mt-2">Welcome back, {user.name}!</h1>
          <p className="text-blue-100 text-sm mt-1">
            Flat {user.flatNumber}
            {user.block ? `, Block ${user.block}` : ''} • Harmony Towers
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/resident/visitor-approvals')}
            className="bg-white text-blue-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center space-x-2 transition hover:bg-blue-50"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Approvals ({pendingCount})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending approvals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-700">Visitor Approvals</span>
            <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {pendingCount} pending
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{pendingCount}</p>
          <p className="text-xs text-gray-500 mb-4">
            Visitors waiting for your approval.
          </p>
          <button
            onClick={() => navigate('/resident/visitor-approvals')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-1"
          >
            <span>Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bill snapshot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-700">Maintenance Dues</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {pendingBill ? `₹${pendingBill.amount}` : 'No dues'}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {pendingBill
              ? `Due ${new Date(pendingBill.dueDate).toLocaleDateString()}`
              : 'All bills are cleared.'}
          </p>
          <button
            onClick={() => navigate('/resident/bills')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-semibold transition"
          >
            View Bills
          </button>
        </div>

        {/* Latest notice */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-700">Latest Notice</span>
            <Megaphone className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-gray-900 mb-1">
            {latestNotice ? latestNotice.title : 'No notices yet'}
          </p>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {latestNotice ? latestNotice.content : 'Check back later.'}
          </p>
          <button
            onClick={() => setShowNotices((prev) => !prev)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-semibold transition"
          >
            {showNotices ? 'Hide Notices' : 'View All Notices'}
          </button>
          {showNotices && (
            <div className="mt-4 space-y-3">
              {notices.map((notice) => (
                <div key={notice._id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-sm">{notice.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notice.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-xs text-gray-500">No notices available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bookings snapshot */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Recent Amenity Bookings</span>
          </h3>
          <button
            onClick={() => navigate('/resident/bookings')}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition"
          >
            Book Amenity
          </button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No amenity bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bookings.slice(0, 3).map((booking) => (
              <div
                key={booking._id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <h4 className="font-semibold text-gray-800">{booking.amenity}</h4>
                <p className="text-xs text-gray-500">
                  {booking.date} • {booking.time}
                </p>
                <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}