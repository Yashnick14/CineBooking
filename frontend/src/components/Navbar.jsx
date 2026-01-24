import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
    window.location.reload(); 
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] py-4 px-8 z-50 flex justify-center items-center glass">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-text-main uppercase font-display tracking-tight z-50 relative">
            CINE<span className="text-primary">BOOKING</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-text-main z-50 relative focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className="font-medium text-base text-text-muted hover:text-text-main transition">Movies</Link>
            <Link to="/book" className="font-medium text-base text-text-muted hover:text-text-main transition">Book</Link>
            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className="px-4 py-2 bg-primary text-white rounded-lg text-base hover:brightness-110 active:scale-95 transition">Admin</Link>
                )}
                <button 
                  onClick={logoutHandler} 
                  className="bg-white/10 border border-white/20 text-text-main px-4 py-2 rounded-lg text-base font-medium hover:bg-red-500 hover:text-white hover:border-transparent transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="font-medium text-base text-text-muted hover:text-text-main transition">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Moved outside nav to escape transform containing block */}
      <div className={`fixed inset-0 bg-[#0f0f0f]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Link to="/" className="text-2xl font-bold text-text-main transition" onClick={() => setIsMenuOpen(false)}>Movies</Link>
        <Link to="/book" className="text-2xl font-bold text-text-main transition" onClick={() => setIsMenuOpen(false)}>Book</Link>
        {user ? (
          <>
            {user.isAdmin && (
              <Link to="/admin" className="text-2xl font-bold text-primary transition" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
            )}
            <button 
              onClick={() => {
                toggleMenu();
                logoutHandler();
              }} 
              className="text-2xl font-bold text-red-500 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-2xl font-bold text-primary transition" onClick={() => setIsMenuOpen(false)}>Login</Link>
        )}
      </div>
    </>
  );
};

export default Navbar;
