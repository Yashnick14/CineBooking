import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data } = await axios.get(`/api/movies/${id}`);
        setMovie(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch movie details');
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Generate next 7 days for selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleBookingClick = () => {
    setIsModalOpen(true);
    setSelectedDate(getAvailableDates()[0].toISOString().split('T')[0]);
  };

  const confirmBooking = () => {
    if (selectedDate && selectedTime) {
      navigate(`/booking/${id}?date=${selectedDate}&time=${selectedTime}&screen=${movie.screen}`);
    } else {
      alert('Please select a showtime');
    }
  };

  if (loading) return <div className="text-center pt-32 text-xl">Loading...</div>;
  if (error) return <div className="text-center pt-32 text-xl text-red-500">{error}</div>;
  if (!movie) return <div className="text-center pt-32 text-xl">Movie not found</div>;

  const dates = getAvailableDates();

  return (
    <div className="pt-[120px] min-h-screen relative max-w-[1200px] mx-auto pb-[50px] animate-fade-in px-4">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center -z-10 blur-[80px] brightness-[0.3]" 
        style={{ backgroundImage: `url(${movie.posterUrl})` }}
      ></div>
      
      <div className="flex gap-16 items-start max-lg:flex-col max-lg:items-center max-lg:text-center">
        <div className="w-[350px] shrink-0 overflow-hidden p-[10px] h-[520px] max-md:w-full max-md:max-w-[300px] max-md:h-auto glass-card">
          <img 
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1170&auto=format&fit=crop'} 
            alt={movie.title} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-1">
          <span className="text-primary font-bold uppercase text-sm tracking-wider">
            {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
          </span>
          <h1 className="text-5xl md:text-6xl font-display tracking-tight my-4 max-md:text-4xl">
            {movie.title}
          </h1>
          
          <div className="flex gap-6 text-text-muted mb-8 font-medium max-lg:justify-center max-sm:flex-col max-sm:gap-2 max-sm:text-sm">
            <span>{movie.duration} min</span>
            <span>{movie.language}</span>
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs uppercase tracking-wide border border-white/20">
              {movie.status}
            </span>
          </div>
          
          <p className="text-lg text-text-muted mb-8 leading-relaxed max-sm:text-base">
            {movie.description}
          </p>
          
          <div className="mb-12">
            <h3 className="text-xl mb-2 font-bold">Cast</h3>
            <p className="text-text-muted">
              {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}
            </p>
          </div>
          
          {movie.status === 'Now Showing' && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 text-left max-lg:inline-block max-lg:text-left">
              <p className="mb-1"><strong className="text-text-main">Screen:</strong> <span className="text-text-muted">{movie.screen}</span></p>
              <p><strong className="text-text-main">Show Times:</strong> <span className="text-text-muted">{Array.isArray(movie.showTimes) ? movie.showTimes.join(', ') : movie.showTimes}</span></p>
            </div>
          )}
          
          {movie.status === 'Now Showing' && (
            <div className="mt-8">
              <button 
                className="py-5 px-12 bg-primary text-white text-lg font-bold rounded-xl uppercase tracking-wider hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition transform duration-300 max-md:w-full max-md:py-4 max-md:text-base"
                onClick={handleBookingClick}
              >
                Book Tickets
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-[90%] max-w-[600px] p-10 relative glass-card animate-fade-in max-md:p-6" onClick={e => e.stopPropagation()}>
            <h2 className="mb-8 text-3xl font-bold max-md:text-2xl">Select Date & Time</h2>
            <button 
              className="absolute top-6 right-6 text-3xl text-text-muted hover:text-white transition"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            
            <div className="flex gap-4 overflow-x-auto pb-6 mb-8 scrollbar-hide">
              {dates.map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                return (
                  <div 
                    key={idx} 
                    className={`min-w-[80px] p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center cursor-pointer transition hover:bg-white/10 ${isSelected ? '!bg-primary !border-primary shadow-[0_0_20px_rgba(229,9,20,0.3)]' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <span className="text-xs uppercase opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <strong className="text-2xl my-1">{date.getDate()}</strong>
                    <span className="text-xs uppercase opacity-80">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mb-10">
                <h3 className="text-lg mb-4 text-text-muted font-medium">Available Showtimes</h3>
                {movie.showTimes && movie.showTimes.length > 0 && 
                 selectedDate >= new Date(movie.releaseDate).toISOString().split('T')[0] ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                    {movie.showTimes.map((time, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition text-center hover:bg-white/10 ${selectedTime === time ? '!border-primary !bg-[rgba(229,9,20,0.1)]' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        <span className="block font-bold text-base mb-1">{time}</span>
                        <span className="text-xs text-text-muted">{movie.screen}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-white/5 rounded-xl text-center text-text-muted border border-dashed border-white/10">
                    <p>currently no shows available</p>
                  </div>
                )}
              </div>
            )}

            <button 
              className="w-full py-5 bg-primary text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:grayscale hover:brightness-110 transition"
              disabled={!selectedTime}
              onClick={confirmBooking}
            >
              Continue to Seating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
