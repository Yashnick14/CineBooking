import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef();
  const queryParams = new URLSearchParams(location.search);
  const selectedShowDate = queryParams.get('date');
  const selectedShowTime = queryParams.get('time');
  const selectedScreenName = queryParams.get('screen');

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [movie, setMovie] = useState(null);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation Modal State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await axios.get(`/api/movies/${id}`);
        const movieData = movieRes.data;
        setMovie(movieData);

        const screenRes = await axios.get('/api/screens');
        const screenToMatch = selectedScreenName || movieData.screen;
        const matchedScreen = screenRes.data.find(s => s.name === screenToMatch);
        setScreen(matchedScreen);
        
        // Fetch occupied seats
        const occupiedRes = await axios.get(`/api/bookings/occupied-seats`, {
          params: {
            movie: id,
            showDate: selectedShowDate,
            showTime: selectedShowTime
          }
        });
        setOccupiedSeats(occupiedRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking data');
        setLoading(false);
      }
    };
    fetchData();
  }, [id, selectedScreenName, selectedShowDate, selectedShowTime]);

  const toggleSeat = (row, col) => {
    const seatId = `${row}-${col}`;
    if (occupiedSeats.includes(seatId)) return; // Can't select occupied

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedShowDate || !selectedShowTime) {
      alert('Show details missing. Please select a showtime again.');
      navigate(`/movie/${id}`);
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    // Show confirmation modal instead of immediately booking
    setShowConfirmationModal(true);
  };

  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const formattedSeats = selectedSeats.map(seatId => {
      const [row, col] = seatId.split('-').map(Number);
      return {
        row,
        col,
        seatNumber: `${String.fromCharCode(65 + row)}${col + 1}`,
        price: 1300,
      };
    });

    const bookingData = {
      user: userInfo ? userInfo._id : null,
      movie: id,
      screen: screen._id,
      showDate: selectedShowDate,
      showTime: selectedShowTime,
      seats: formattedSeats,
      totalAmount: selectedSeats.length * 1300,
    };

    // Navigate to payment page with booking data
    navigate('/payment', { 
      state: { 
        bookingData: {
          ...bookingData,
          screenName: screen.name // Ensure screenName is passed
        }, 
        movieTitle: movie.title 
      } 
    });
    
    setIsSubmitting(false);
  };

  const downloadPDF = async () => {
    const element = ticketRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ticket-${bookingDetails._id}.pdf`);
  };

  const renderSeats = () => {
    if (!screen) return <p>Screen configuration not found.</p>;
    
    const seatGrid = [];
    const rows = screen.rows;
    const cols = screen.cols;
    
    for (let i = 0; i < rows; i++) {
      const rowSeats = [];
      for (let j = 0; j < cols; j++) {
        const seatId = `${i}-${j}`;
        const isSelected = selectedSeats.includes(seatId);
        const isOccupied = occupiedSeats.includes(seatId);
        
        rowSeats.push(
          <div 
            key={seatId} 
            className={`w-[25px] h-[25px] bg-white/10 border border-border-glass rounded cursor-pointer transition duration-300 hover:bg-white/20 hover:scale-110 ${isSelected ? '!bg-[#2ecc71] !border-[#27ae60] shadow-[0_0_10px_rgba(46,204,113,0.4)]' : ''} ${isOccupied ? '!bg-[#e74c3c] !border-[#c0392b] cursor-not-allowed opacity-80' : ''}`}
            onClick={() => !isOccupied && toggleSeat(i, j)}
          ></div>
        );
      }
      seatGrid.push(<div key={i} className="flex justify-center gap-[15px] min-w-max px-4">{rowSeats}</div>);
    }
    return seatGrid;
  };

  if (loading) return <div className="text-center pt-32 text-xl">Loading...</div>;
  if (error) return <div className="text-center pt-32 text-xl text-red-500">{error}</div>;
  if (!movie) return <div className="text-center pt-32 text-xl">Movie not found</div>;

  return (
    <div className="pt-[160px] pb-[50px] flex justify-center items-center min-h-screen animate-fade-in px-4">
      <div className="w-[90%] max-w-[900px] p-12 text-center glass-card max-md:p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-primary">{movie.title}</h2>
          <p className="text-text-muted">{movie.language} • {movie.genre.join(', ')}</p>
          <div className="flex justify-center gap-6 mt-4 text-sm font-medium flex-wrap max-md:flex-col max-md:gap-2">
            <span><strong>Date:</strong> {selectedShowDate ? new Date(selectedShowDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Selected'}</span>
            <span><strong>Time:</strong> {selectedShowTime || 'Not Selected'}</span>
            <span><strong>Screen:</strong> {selectedScreenName || movie.screen}</span>
          </div>
        </div>

        <div className="w-[80%] h-[50px] bg-gradient-to-b from-primary to-transparent mx-auto my-12 rounded-t-[50%] flex justify-center items-center text-white font-bold tracking-[5px] shadow-[0_-10px_20px_rgba(229,9,20,0.2)]">SCREEN</div>
        
        <div className="mb-12 flex flex-col gap-4 items-start md:items-center overflow-x-auto pb-4 w-full scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
          {renderSeats()}
        </div>

        <div className="flex justify-center gap-8 mb-12 max-md:gap-3 max-[425px]:flex-col max-[425px]:items-start">
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap"><div className="w-[20px] h-[20px] bg-white/10 border border-white/20 rounded"></div> Available</div>
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap"><div className="w-[20px] h-[20px] bg-[#2ecc71] border border-[#27ae60] rounded"></div> Selected</div>
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap"><div className="w-[20px] h-[20px] bg-[#e74c3c] border border-[#c0392b] rounded opacity-80"></div> Occupied</div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-white/10 max-md:flex-col max-md:gap-6">
          <div className="text-left max-md:text-center">
            <p className="mb-1">Selected Seats: <span className="font-bold text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></p>
            <p>Total Price: <span className="font-bold text-primary text-xl">LKR {selectedSeats.length * 1300}</span></p>
          </div>
          <button 
            className="py-4 px-12 bg-primary text-white rounded-xl font-bold text-lg uppercase tracking-wider transition shadow-[0_5px_15px_rgba(229,9,20,0.2)] hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(229,9,20,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/10 disabled:shadow-none max-md:w-full"
            disabled={selectedSeats.length === 0 || isSubmitting}
            onClick={handleConfirmBooking}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] p-10 glass-card animate-fade-in relative">
            <h2 className="text-2xl font-bold mb-8 text-primary text-center">Confirm Your Booking</h2>
            <div className="mb-8 space-y-3">
              <div className="flex justify-between py-3 border-b border-white/10">
                <strong className="text-text-muted">Movie:</strong>
                <span className="text-white text-right">{movie.title}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <strong className="text-text-muted">Date:</strong>
                <span className="text-white text-right">{new Date(selectedShowDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <strong className="text-text-muted">Time:</strong>
                <span className="text-white text-right">{selectedShowTime}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <strong className="text-text-muted">Screen:</strong>
                <span className="text-white text-right">{selectedScreenName || movie.screen}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <strong className="text-text-muted">Seats:</strong>
                <span className="text-white text-right">{selectedSeats.map(seatId => {
                  const [row, col] = seatId.split('-').map(Number);
                  return `${String.fromCharCode(65 + row)}${col + 1}`;
                }).join(', ')}</span>
              </div>
              <div className="flex justify-between py-4 mt-4 border-t-2 border-primary">
                <strong className="text-text-muted">Total Amount:</strong>
                <span className="text-2xl font-bold text-primary">LKR {selectedSeats.length * 1300}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                className="flex-1 py-4 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition"
                onClick={() => setShowConfirmationModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-4 rounded-lg font-bold bg-primary text-white hover:brightness-110 hover:-translate-y-0.5 shadow-lg transition"
                onClick={handleProceedToPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTicketModal && bookingDetails && (
        <div className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] animate-fade-in relative">
            <div className="bg-white text-[#333] rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative before:content-[''] before:absolute before:w-[30px] before:h-[30px] before:bg-[#000000e6] before:rounded-full before:top-1/2 before:-left-[15px] before:-translate-y-1/2 before:z-10 after:content-[''] after:absolute after:w-[30px] after:h-[30px] after:bg-[#000000e6] after:rounded-full after:top-1/2 after:-right-[15px] after:-translate-y-1/2 after:z-10" ref={ticketRef}>
              <div className="bg-[#1a1a1a] text-white p-8 text-center">
                <p className="tracking-widest text-xs mb-1 opacity-70">TICKET CONFIRMED</p>
                <h2 className="text-2xl font-bold text-primary">{bookingDetails.movieTitle}</h2>
              </div>
              <div className="p-8 pb-4 relative">
                <div className="grid grid-cols-2 gap-6 mb-8 text-left">
                  <div className="flex flex-col">
                    <label className="text-xs text-[#888] uppercase tracking-wider mb-1">Date</label>
                    <span className="font-bold text-base">{new Date(bookingDetails.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-[#888] uppercase tracking-wider mb-1">Time</label>
                    <span className="font-bold text-base">{bookingDetails.time}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-[#888] uppercase tracking-wider mb-1">Screen</label>
                    <span className="font-bold text-base">{bookingDetails.screenName}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-[#888] uppercase tracking-wider mb-1">Total</label>
                    <span className="font-bold text-base">${bookingDetails.totalAmount}</span>
                  </div>
                </div>
                <div className="border-t-2 border-b-2 border-dashed border-[#eee] py-6 mb-8 text-center">
                  <label className="block text-xs text-[#888] mb-2">Selected Seats</label>
                  <div className="text-2xl font-extrabold text-[#1a1a1a] tracking-[2px]">
                    {bookingDetails.seats.map(s => s.seatNumber).join(', ')}
                  </div>
                </div>
                <div className="w-full h-[60px] opacity-80 mb-6 bg-[repeating-linear-gradient(90deg,#333,#333_2px,#fff_2px,#fff_4px)]"></div>
                <p className="text-[0.7rem] text-[#888] text-center mb-4">
                  Booking ID: {bookingDetails._id}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="flex-1 p-3 rounded-lg font-bold bg-primary text-white hover:brightness-110 transition" onClick={downloadPDF}>Download PDF</button>
              <button className="flex-1 p-3 rounded-lg font-bold bg-[#eee] text-[#333] hover:bg-[#ddd] transition" onClick={() => navigate('/')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
