/**
 * Resident amenity booking: browse amenities, book a slot, and manage
 * existing bookings — all persisted in MongoDB.
 * @module pages/resident/BookAmenities
 */
import { useEffect, useState, useMemo } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AMENITIES = [
  { name: 'Clubhouse Party Hall', capacity: '100 Persons', timing: '10 AM - 10 PM' },
  { name: 'Tennis Court', capacity: '4 Persons', timing: '6 AM - 9 PM' },
  { name: 'Swimming Pool', capacity: '30 Persons', timing: '6 AM - 8 PM' },
];

const TIME_SLOTS = [
  { label: 'Morning (6 AM - 10 AM)', startHour: 6 },
  { label: 'Afternoon (12 PM - 4 PM)', startHour: 12 },
  { label: 'Evening (6 PM - 10 PM)', startHour: 18 },
];

export default function BookAmenities() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState(AMENITIES[0].name);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[0].label);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchBookings = async () => {
    setError('');
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Check if a time slot has already ended for today
  const isTimeSlotExpired = (slotLabel) => {
    if (!bookingDate || bookingDate !== todayStr) return false;
    const currentHour = new Date().getHours();
    const slotConfig = TIME_SLOTS.find((s) => s.label === slotLabel);
    return slotConfig ? currentHour >= slotConfig.startHour : false;
  };

  // Check if someone else already booked this amenity on this date & slot
  const isTimeSlotAlreadyBooked = (slotLabel) => {
    if (!bookingDate) return false;
    return bookings.some(
      (b) =>
        b.amenity === selectedAmenity &&
        b.date === bookingDate &&
        b.time === slotLabel &&
        b.status === 'Confirmed'
    );
  };

  // Keep selected slot valid if the currently selected one becomes unavailable
  useEffect(() => {
    if (bookingDate) {
      const currentSelectedUnavailable =
        isTimeSlotExpired(bookingTime) || isTimeSlotAlreadyBooked(bookingTime);

      if (currentSelectedUnavailable) {
        const firstAvailable = TIME_SLOTS.find(
          (s) => !isTimeSlotExpired(s.label) && !isTimeSlotAlreadyBooked(s.label)
        );
        if (firstAvailable) {
          setBookingTime(firstAvailable.label);
        }
      }
    }
  }, [bookingDate, selectedAmenity, bookings]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');

    if (isTimeSlotExpired(bookingTime)) {
      setError('This time slot has already passed for today.');
      return;
    }

    if (isTimeSlotAlreadyBooked(bookingTime)) {
      setError('This slot is already reserved by another resident.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        amenity: selectedAmenity,
        date: bookingDate,
        time: bookingTime,
      });
      setBookingDate('');
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'Cancelled' });
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const isFormValid =
    bookingDate &&
    !isTimeSlotExpired(bookingTime) &&
    !isTimeSlotAlreadyBooked(bookingTime);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Book Society Amenities</h1>
        <p className="text-sm text-gray-500">
          Reserve the clubhouse, tennis court, or swimming pool.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AMENITIES.map((amenity) => (
          <div
            key={amenity.name}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{amenity.name}</h3>
              <p className="text-xs text-blue-600 font-semibold mb-3">
                {amenity.name === 'Clubhouse Party Hall' ? '₹2,000 / slot' : 'Free for residents'}
              </p>
              <p className="text-xs text-gray-600 mb-1">Capacity: {amenity.capacity}</p>
              <p className="text-xs text-gray-600 mb-4">Timings: {amenity.timing}</p>
            </div>
            <button
              onClick={() => setSelectedAmenity(amenity.name)}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                selectedAmenity === amenity.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {selectedAmenity === amenity.name ? 'Selected for Booking' : 'Select Amenity'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Book {selectedAmenity}</h3>
        <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={todayStr}
              className="field w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Time Slot</label>
            <select
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="field w-full px-3 py-2 border rounded-lg"
            >
              {TIME_SLOTS.map((slot) => {
                const expired = isTimeSlotExpired(slot.label);
                const booked = isTimeSlotAlreadyBooked(slot.label);
                const disabled = expired || booked;

                let tag = '';
                if (expired) tag = ' (Expired)';
                else if (booked) tag = ' (Reserved)';

                return (
                  <option key={slot.label} value={slot.label} disabled={disabled}>
                    {slot.label} {tag}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition h-10 flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Booking…' : 'Confirm Booking'}</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <span>My Bookings</span>
        </h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No amenity bookings found.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{booking.amenity}</h4>
                  <p className="text-xs text-gray-500">
                    {booking.date} • {booking.time}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === 'Confirmed' && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}