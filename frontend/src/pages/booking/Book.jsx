import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Book = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    fetchMovies(selectedDate);
  }, [selectedDate]);

  const fetchMovies = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const { data } = await axios.get(`/api/movies?date=${formattedDate}`);
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const isSameDate = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const navigateToBooking = (movieId, showTime, screenName) => {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      navigate(`/booking/${movieId}?date=${formattedDate}&time=${showTime}&screen=${screenName}`);
  };

  return (
    <div className="pt-[120px] px-8 pb-8 min-h-[80vh]">
      <div className="flex justify-start md:justify-center gap-4 p-6 mb-8 overflow-x-auto glass-card scrollbar-hide">
        {dates.map((date, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center py-3 px-5 rounded-xl cursor-pointer transition-all duration-300 min-w-[70px] bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 ${isSameDate(date, selectedDate) ? '!bg-primary text-white font-bold shadow-[0_4px_15px_rgba(229,9,20,0.4)]' : ''}`}
            onClick={() => handleDateClick(date)}
          >
            <span className="text-sm opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="text-2xl font-bold">{date.getDate()}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 max-w-[900px] mx-auto">
        {movies.length > 0 ? (
          movies.map(movie => (
            <div key={movie._id} className="flex gap-6 p-6 rounded-2xl items-center glass-card max-sm:flex-col max-sm:text-center animate-fade-in">
              <img src={movie.posterUrl} alt={movie.title} className="w-[100px] h-[150px] object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="mb-2 text-text-white text-xl font-bold">{movie.title}</h3>
                <p className="text-text-muted text-sm mb-4">{movie.screen}</p>
                <div className="flex flex-wrap gap-3 max-sm:justify-center">
                    {movie.showTimes && movie.showTimes.map((time, idx) => (
                        <button 
                            key={idx} 
                            className="bg-white/10 border border-white/20 text-white py-2 px-4 rounded-lg cursor-pointer transition hover:bg-primary hover:border-primary focus:outline-none"
                            onClick={() => navigateToBooking(movie._id, time, movie.screen)}
                        >
                            {time}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 text-text-muted glass-card">
            <h3 className="text-xl">No movies scheduled for this date</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
