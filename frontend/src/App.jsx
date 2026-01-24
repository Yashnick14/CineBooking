import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Book from './pages/booking/Book';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MovieDetails from './pages/movie/MovieDetails';
import Booking from './pages/booking/Booking';
import BookingSuccess from './pages/booking/BookingSuccess';
import BookingCancelled from './pages/booking/BookingCancelled';
import PaymentPage from './pages/payment/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';


import { useLocation } from 'react-router-dom';

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? "container" : "w-full min-h-screen bg-bg-dark"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/booking-cancelled" element={<BookingCancelled />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
