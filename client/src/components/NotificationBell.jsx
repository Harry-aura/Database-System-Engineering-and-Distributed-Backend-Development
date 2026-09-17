/**
 * Notification bell for residents.
 * Polls the pending visitor endpoint and shows a badge with the live count.
 * @module components/NotificationBell
 */
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/** Poll interval in milliseconds. */
const POLL_INTERVAL = 5000;

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'resident') {
      setPendingCount(0);
      return undefined;
    }

    let active = true;

    const fetchPending = async () => {
      try {
        const { data } = await api.get('/visitors/pending', {
          params: { flatNumber: user.flatNumber },
        });
        if (active) setPendingCount(data.length);
      } catch {
        // Keep the badge unchanged on transient errors.
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleClick = () => {
    if (user?.role === 'resident') navigate('/resident/visitor-approvals');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {pendingCount > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
          {pendingCount}
        </span>
      )}
    </button>
  );
}