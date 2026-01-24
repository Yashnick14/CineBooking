import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      if (data.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="h-screen flex justify-center items-center px-4 animate-fade-in">
      <div className="w-full max-w-[450px] p-12 text-center glass-card">
        <h2 className="text-3xl mb-2 font-display tracking-tight">Welcome Back</h2>
        <p className="text-text-muted text-sm mb-8">Login to your account to book tickets</p>
        <form className="text-left mb-6" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs text-text-muted mb-2 uppercase tracking-wide">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full p-3 pl-4 bg-white/5 border border-border-glass rounded-lg text-white font-inherit transition focus:border-primary focus:outline-none focus:bg-white/10"
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs text-text-muted mb-2 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full p-3 pl-4 bg-white/5 border border-border-glass rounded-lg text-white font-inherit transition focus:border-primary focus:outline-none focus:bg-white/10"
            />
          </div>
          <button type="submit" className="w-full p-4 bg-primary text-white font-bold rounded-lg mt-4 uppercase tracking-wide hover:brightness-110 transition">Sign In</button>
        </form>
        <div className="mt-8 text-text-muted text-sm">
          New Customer? <Link to="/register" className="text-primary font-bold hover:text-white transition">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
