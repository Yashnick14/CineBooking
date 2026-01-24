import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageScreens = () => {
  const [screens, setScreens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Main Hall',
    rows: 8,
    cols: 12,
    totalSeats: 96
  });

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const { data } = await axios.get('/api/screens');
      setScreens(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (screens.length > 0) {
        await axios.put(`/api/screens/${screens[0]._id}`, formData, config);
      } else {
        await axios.post('/api/screens', formData, config);
      }
      setIsModalOpen(false);
      fetchScreens();
    } catch (err) {
      alert('Action failed!');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <h2 className="text-2xl font-bold">Hall Configuration</h2>
        <button className="py-3 px-6 bg-primary text-white rounded-lg font-semibold hover:brightness-110 transition" onClick={() => setIsModalOpen(true)}>Configure Hall</button>
      </div>

      <div className="w-full rounded-xl glass-card p-12 min-h-[400px] flex justify-center items-center">
        {screens.length > 0 ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">{screens[0].name}</h3>
            <p className="text-white text-lg">Layout: {screens[0].rows} Rows x {screens[0].cols} Columns</p>
            <p className="text-text-muted mt-2">Total Capacity: {screens[0].totalSeats} Seats</p>
          </div>
        ) : (
          <p className="text-text-muted italic">Hall not configured yet.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-[90%] max-w-[600px] p-8 glass-card animate-fade-in max-md:p-6">
            <h2 className="mb-8 font-display text-xl font-bold">Configure Hall</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <input type="text" placeholder="Hall Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none col-span-2 max-sm:col-span-1" />
                <input type="number" placeholder="Rows" value={formData.rows} onChange={(e) => setFormData({...formData, rows: e.target.value, totalSeats: e.target.value * formData.cols})} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                <input type="number" placeholder="Columns" value={formData.cols} onChange={(e) => setFormData({...formData, cols: e.target.value, totalSeats: formData.rows * e.target.value})} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="px-6 py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-6 py-3 bg-primary rounded-lg text-white font-bold hover:brightness-110 transition">Save Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageScreens;
