import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
// REPLACE THIS STRING WITH YOUR ACTUAL STRIPE PUBLISHABLE KEY
const key = 'pk_test_51RpmGjRwHgK4EN1yuMOV5dbEar6Z6CIrVdRU2A1TsXiP6qjPyq6vFYYKSEXpVSyS1u90FkECX05SSqqVBjU4QEZC00Zc7ncJSW'; 

console.log('Stripe Key available:', !!key);
// Prevent crash if key is missing
const stripePromise = key ? loadStripe(key) : null;

const CheckoutForm = ({ totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('CheckoutForm: stripe loaded?', !!stripe);
  console.log('CheckoutForm: elements loaded?', !!elements);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success`,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      <button disabled={isProcessing || !stripe || !elements} className="w-full bg-primary text-white p-4 rounded-lg text-lg font-bold cursor-pointer transition duration-300 mt-4 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(229,9,20,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none">
        {isProcessing ? 'Processing...' : `Pay LKR ${totalAmount}`}
      </button>
      {message && <div className="mt-4 text-[#ff4444] text-sm text-center">{message}</div>}
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData, movieTitle } = location.state || {};
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!bookingData) {
      navigate('/');
      return;
    }

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post('/api/payments/create-payment-intent', {
          totalAmount: bookingData.totalAmount,
          bookingData,
        });
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Failed to init payment:', error);
        alert('Could not initialize payment. Please try again.');
        navigate('/');
      }
    };

    createPaymentIntent();
  }, [bookingData, navigate]);

  if (!bookingData || !clientSecret) {
    return (
      <div className="min-h-screen flex justify-center items-center p-8 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#000_100%)]">
        <div className="text-xl text-white">Loading Payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-8 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#000_100%)] animate-fade-in">
      <div className="grid grid-cols-[1fr_1fr] gap-8 max-w-[1000px] w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 max-md:grid-cols-1 max-md:max-w-[500px]">
        <div className="pr-8 border-r border-white/10 max-md:pr-0 max-md:pb-8 max-md:border-r-0 max-md:border-b">
          <h2 className="text-white mb-6 text-2xl font-bold">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between mb-4 text-[#b3b3b3]">
              <label>Movie</label>
              <span className="text-white font-medium">{movieTitle}</span>
            </div>
            <div className="flex justify-between mb-4 text-[#b3b3b3]">
              <label>Screen</label>
              <span className="text-white font-medium">{bookingData.screenName}</span> {/* We need to ensure we pass screenName */}
            </div>
            <div className="flex justify-between mb-4 text-[#b3b3b3]">
              <label>Date</label>
              <span className="text-white font-medium">{new Date(bookingData.showDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-[#b3b3b3]">
              <label>Time</label>
              <span className="text-white font-medium">{bookingData.showTime}</span>
            </div>
            <div className="flex justify-between mb-4 text-[#b3b3b3]">
              <label>Seats ({bookingData.seats.length})</label>
              <span className="text-white font-medium">{bookingData.seats.map(s => s.seatNumber).join(', ')}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-2xl text-primary font-bold">
              <label>Total</label>
              <span>LKR {bookingData.totalAmount}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white mb-6 text-2xl font-bold">Payment Details</h2>
          {!stripePromise ? (
             <div className="mt-4 text-[orange] text-sm text-center">
               Configuration Error: Stripe Publishable Key is missing in frontend/.env
             </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, theme: 'night', labels: 'floating' }}>
              <CheckoutForm totalAmount={bookingData.totalAmount} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
