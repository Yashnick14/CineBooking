import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { data } = await axios.post('/api/payments/verify', {
          paymentIntentId,
        });
        setBooking(data);
        
        // Fetch movie details specifically for the poster
        if (data.movie) {
           const movieRes = await axios.get(`/api/movies/${data.movie}`);
           setMovie(movieRes.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Payment verification failed:', error);
        setLoading(false);
      }
    };

    if (paymentIntentId && redirectStatus === 'succeeded') {
      verifyPayment();
    } else if (redirectStatus === 'failed') {
      navigate('/booking-cancelled');
    }
  }, [paymentIntentId, redirectStatus, navigate]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(229, 9, 20); // Brand Red
    doc.text("CINEBOOKING", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("Official Booking Receipt", 105, 30, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35); // Horizontal Line
    
    // -- Booking Details --
    doc.setFontSize(10);
    const startY = 45;
    const lineHeight = 10;
    
    // Helper for rows
    const addRow = (label, value, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 80, y);
    };

    addRow("Booking ID:", booking._id.toUpperCase(), startY);
    addRow("Transaction Date:", new Date().toLocaleString(), startY + lineHeight);
    addRow("Payment Status:", "PAID (Stripe)", startY + lineHeight * 2);
    
    doc.line(20, startY + lineHeight * 3, 190, startY + lineHeight * 3);
    
    // -- Movie Details --
    const movieY = startY + lineHeight * 4;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Movie Details", 20, movieY);
    
    doc.setFontSize(10);
    addRow("Movie:", booking.movieTitle || (movie ? movie.title : 'N/A'), movieY + 10);
    addRow("Screen:", booking.screenName || 'Screen 1', movieY + 20);
    addRow("Show Date:", new Date(booking.showDate).toLocaleDateString(), movieY + 30);
    addRow("Show Time:", booking.showTime, movieY + 40);
    addRow("Seats:", booking.seats.map(s => s.seatNumber).join(', '), movieY + 50);
    
    doc.line(20, movieY + 60, 190, movieY + 60);
    
    // -- Total --
    const totalY = movieY + 75;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 120, totalY);
    doc.setTextColor(229, 9, 20);
    doc.text(`LKR ${booking.totalAmount}`, 160, totalY);
    
    // -- Footer --
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing CineBooking!", 105, 280, { align: "center" });
    doc.text("Please show this receipt at the counter if requested.", 105, 285, { align: "center" });
    
    doc.save(`Receipt-${booking._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-[140px] pb-8 px-8 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#000_100%)] gap-8">
        <div className="text-xl text-white">Verifying Payment...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-[140px] pb-8 px-8 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#000_100%)] gap-8">
        <div className="text-xl text-red-500">Payment verification failed. Please contact support.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-[140px] pb-8 px-8 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#000_100%)] gap-8">
      <div className="text-center text-white animate-fade-in">
        <div className="w-[70px] h-[70px] bg-[#2ecc71] rounded-full text-white text-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(46,204,113,0.4)]">✓</div>
        <h1 className="text-3xl mb-2 text-[#2ecc71] font-bold">Booking Successful!</h1>
        <p className="text-[#aaa]">Your seats are confirmed. Here is your ticket.</p>
      </div>

      <div className="animate-[slideUp_0.6s_ease-out]">
        <div id="ticket-content" className="flex w-[800px] max-w-full bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative text-[#333] max-md:flex-col max-md:w-[350px]">
          <div className="w-[250px] bg-primary p-8 flex flex-col justify-center items-center text-white relative border-r-2 border-dashed border-white/40 max-md:w-full max-md:flex-row max-md:justify-between max-md:p-6 max-md:border-r-0 max-md:border-b-2 max-md:border-dashed after:content-[''] after:absolute after:-right-[10px] after:bottom-[-10px] after:w-[20px] after:h-[20px] after:bg-[#1a1a2e] after:rounded-full before:content-[''] before:absolute before:-right-[10px] before:top-[-10px] before:w-[20px] before:h-[20px] before:bg-[#1a1a2e] before:rounded-full max-md:after:hidden max-md:before:hidden">
            {movie && movie.poster && (
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover rounded-lg mb-4 shadow-lg max-md:w-[60px] max-md:mb-0" />
            )}
            <div className="text-xl font-bold text-center leading-tight">{booking.movieTitle || (movie ? movie.title : 'Movie Ticket')}</div>
          </div>
          
          <div className="flex-1 p-8 pl-12 flex flex-col bg-gradient-to-br from-white to-[#f0f0f0] max-md:p-6">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#ddd] pb-4">
              <div className="text-2xl font-extrabold text-primary tracking-wide font-display">CINEBOOKING</div>
              <div className="font-mono text-lg text-[#666] bg-[#eee] px-3 py-1 rounded">ID: {booking._id.slice(-8).toUpperCase()}</div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 max-md:grid-cols-1 max-md:gap-4">
              <div>
                <label className="block text-sm uppercase text-[#888] mb-1 font-semibold">Screen</label>
                <span className="text-lg font-bold text-[#222]">{booking.screenName || 'Screen 1'}</span>
              </div>
              <div>
                <label className="block text-sm uppercase text-[#888] mb-1 font-semibold">Date</label>
                <span className="text-lg font-bold text-[#222]">{new Date(booking.showDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div>
                <label className="block text-sm uppercase text-[#888] mb-1 font-semibold">Time</label>
                <span className="text-lg font-bold text-[#222]">{booking.showTime}</span>
              </div>
              <div>
                <label className="block text-sm uppercase text-[#888] mb-1 font-semibold">Seats</label>
                <span className="text-lg font-bold text-[#222]">{booking.seats.map(s => s.seatNumber).join(', ')}</span>
              </div>
            </div>

            <div className="mt-auto flex justify-between items-center">
              <div className="h-[50px] opacity-70">
                 {/* Simple CSS Barcode Effect */}
                 <div style={{
                   display: 'flex', gap: '2px', height: '40px', alignItems: 'flex-end'
                 }}>
                   {[...Array(20)].map((_, i) => (
                     <div key={i} style={{
                       width: Math.random() > 0.5 ? '4px' : '2px',
                       height: '100%',
                       backgroundColor: '#333'
                     }} />
                   ))}
                 </div>
              </div>
              <div className="text-right">
                <label className="block text-sm text-[#888]">Total Paid</label>
                <span className="text-3xl font-extrabold text-primary">LKR {booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <button className="py-3 px-8 rounded-full font-semibold cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg bg-white/10 text-white border border-white/20" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button className="py-3 px-8 rounded-full font-semibold cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg bg-primary text-white flex items-center gap-2" onClick={handleDownloadPDF}>
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
