import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center items-center px-4 animate-fade-in pt-[100px]">
      <div className="w-full max-w-[500px] p-8 glass-card text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white font-display">Booking Cancelled</h1>
        <p className="text-text-muted mb-8 text-lg">Your payment was cancelled. No charges were made.</p>
        <button 
          className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold uppercase tracking-wider hover:bg-white/20 transition hover:-translate-y-1" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingCancelled;
