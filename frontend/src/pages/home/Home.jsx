import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await axios.get('/api/movies');
        setMovies(data);
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };
    fetchMovies();
  }, []);

  const nowShowing = movies.filter(m => m.status === 'Now Showing');
  const comingSoon = movies.filter(m => m.status === 'Coming Soon');

  const MovieCard = ({ movie }) => (
    <div className="glass-card overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
      <div className="h-[380px] overflow-hidden">
        <img 
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1170&auto=format&fit=crop'} 
          alt={movie.title} 
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${movie.status === 'Coming Soon' ? 'object-top' : 'object-center'}`}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
        <p className="text-text-muted text-sm mb-6">{movie.genre.join(', ')} • {movie.duration} min</p>
        <Link 
          to={`/movie/${movie._id}`} 
          className="block w-full text-center py-3 bg-primary text-white font-bold rounded-lg uppercase tracking-wider hover:brightness-110 transition"
        >
          {movie.status === 'Coming Soon' ? 'View Movie' : 'Book Now'}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="pt-[120px] pb-[50px] animate-fade-in">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Experience Cinema Like Never Before
        </h1>
        <p className="text-text-muted text-xl">
          Book your tickets for the latest blockbusters in premium theatres.
        </p>
      </header>
      
      {nowShowing.length > 0 && (
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Now Showing</h2>
            <div className="w-[60px] h-1 bg-primary rounded-full"></div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
            {nowShowing.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Coming Soon</h2>
            <div className="w-[60px] h-1 bg-primary rounded-full"></div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
            {comingSoon.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
