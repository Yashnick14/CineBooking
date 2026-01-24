import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    genre: '',
    duration: '',
    releaseDate: '',
    language: '',
    cast: '',
    status: 'Now Showing',
    screen: '',
    showTimes: ''
  });

  useEffect(() => {
    fetchMovies();
    fetchScreens();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data } = await axios.get('/api/movies');
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchScreens = async () => {
    try {
      const { data } = await axios.get('/api/screens');
      setScreens(data);
    } catch (err) {
      console.error('Error fetching screens:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If status changes to "Coming Soon", clear screen and showTimes
    if (name === 'status' && value === 'Coming Soon') {
      setFormData({ 
        ...formData, 
        [name]: value,
        screen: '',
        showTimes: ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const formattedData = {
      ...formData,
      genre: formData.genre.split(',').map(g => g.trim()),
      cast: formData.cast.split(',').map(c => c.trim()),
      showTimes: formData.showTimes.split(',').map(t => t.trim())
    };

    try {
      if (editingMovie) {
        await axios.put(`/api/movies/${editingMovie._id}`, formattedData, config);
      } else {
        await axios.post('/api/movies', formattedData, config);
      }
      setIsModalOpen(false);
      setEditingMovie(null);
      setFormData({ 
        title: '', description: '', posterUrl: '', genre: '', duration: '', 
        releaseDate: '', language: '', cast: '', status: 'Now Showing', 
        screen: screens[0]?.name || '', showTimes: '' 
      });
      fetchMovies();
    } catch (err) {
      alert('Action failed! Ensure you are logged in as Admin and all fields are filled.');
    }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.delete(`/api/movies/${id}`, config);
      fetchMovies();
    } catch (err) {
      alert('Delete failed!');
    }
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      posterUrl: movie.posterUrl || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      language: movie.language || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''),
      status: movie.status || 'Now Showing',
      screen: movie.screen || '',
      showTimes: Array.isArray(movie.showTimes) ? movie.showTimes.join(', ') : (movie.showTimes || '')
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <h2 className="text-2xl font-bold">Movie Management</h2>
        <button className="py-3 px-6 bg-primary text-white rounded-lg font-semibold hover:brightness-110 transition" onClick={() => { setIsModalOpen(true); setEditingMovie(null); }}>
          Add New Movie
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-xl glass-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Title</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Status</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Screen</th>
              <th className="p-5 border-b border-border-glass text-text-muted uppercase text-xs tracking-wider font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie._id} className="hover:bg-white/5 transition">
                <td className="p-5 border-b border-border-glass text-sm">{movie.title}</td>
                <td className="p-5 border-b border-border-glass">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${movie.status === 'Now Showing' ? 'bg-[#00c853]/10 text-[#00c853] border-[#00c853]/20' : 'bg-[#ffab00]/10 text-[#ffab00] border-[#ffab00]/20'}`}>
                    {movie.status}
                  </span>
                </td>
                <td className="p-5 border-b border-border-glass text-sm">{movie.screen}</td>
                <td className="p-5 border-b border-border-glass">
                  <div className="flex gap-4">
                    <button className="text-[#4facfe] font-semibold hover:text-white transition" onClick={() => openEditModal(movie)}>Edit</button>
                    <button className="text-[#ff4d4d] font-semibold hover:text-white transition" onClick={() => deleteMovie(movie._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-[90%] max-w-[600px] p-8 glass-card animate-fade-in max-md:p-6">
            <h2 className="mb-8 font-display text-xl font-bold">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <input type="text" name="title" placeholder="Movie Title" value={formData.title} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                <input type="number" name="duration" placeholder="Duration (min)" value={formData.duration} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                <input type="text" name="language" placeholder="Language" value={formData.language} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                <input 
                  type="date" 
                  name="releaseDate" 
                  value={formData.releaseDate} 
                  onChange={handleChange} 
                  required={formData.status === 'Now Showing'}
                  disabled={formData.status === 'Coming Soon'}
                  className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input type="text" name="genre" placeholder="Genres (comma separated)" value={formData.genre} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                <input type="text" name="posterUrl" placeholder="Poster URL" value={formData.posterUrl} onChange={handleChange} className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none" />
                
                <select name="status" value={formData.status} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white focus:border-primary focus:outline-none [&>option]:bg-[#1a1a2e] [&>option]:text-white cursor-pointer">
                  <option value="Now Showing">Now Showing</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>

                <select 
                  name="screen" 
                  value={formData.screen} 
                  onChange={handleChange} 
                  required={formData.status === 'Now Showing'}
                  disabled={formData.status === 'Coming Soon'}
                  className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white focus:border-primary focus:outline-none [&>option]:bg-[#1a1a2e] [&>option]:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Select Screen</option>
                  {screens.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>

                <input 
                  type="text" 
                  name="showTimes" 
                  placeholder="Show Times (comma separated, e.g. 10:00 AM, 1:00 PM)" 
                  value={formData.showTimes} 
                  onChange={handleChange} 
                  required={formData.status === 'Now Showing'}
                  disabled={formData.status === 'Coming Soon'}
                  className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed col-span-2 max-sm:col-span-1" 
                />
                
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none h-[100px] resize-none col-span-2 max-sm:col-span-1"></textarea>
                <input type="text" name="cast" placeholder="Cast (comma separated)" value={formData.cast} onChange={handleChange} className="w-full p-3 bg-white/5 border border-border-glass rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none col-span-2 max-sm:col-span-1" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="px-6 py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-6 py-3 bg-primary rounded-lg text-white font-bold hover:brightness-110 transition">Save Movie</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
