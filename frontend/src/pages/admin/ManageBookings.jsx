import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const { data } = await axios.get('/api/bookings', config);
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Hall Bookings</h2>
      </div>
      <div className="w-full overflow-x-auto rounded-xl glass-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">User</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Movie</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Seats</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Total</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking._id} className="hover:bg-white/5 transition">
                <td className="p-5 border-b border-border-glass text-sm">{booking.user?.name}</td>
                <td className="p-5 border-b border-border-glass text-sm">{booking.movie?.title}</td>
                <td className="p-5 border-b border-border-glass text-sm">{booking.seats.map(s => s.seatNumber).join(', ')}</td>
                <td className="p-5 border-b border-border-glass text-sm font-bold">LKR {booking.totalAmount}</td>
                <td className="p-5 border-b border-border-glass text-sm font-semibold" style={{ color: booking.paymentStatus === 'Paid' ? '#4facfe' : '#ff4d4d' }}>{booking.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;
