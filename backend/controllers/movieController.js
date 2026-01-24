const Movie = require('../models/movieModel');

// @desc    Fetch all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  const { date } = req.query;
  let query = {};

  if (date) {
    // If date is provided, find movies released on or available for that date
    // Note: The current model has a single 'releaseDate'. 
    // If the requirement is to show movies *scheduled* on a date, we usually check if the movie is 'Now Showing'
    // and potentially if it has showtimes for that specific date.
    // However, the current model only stores `releaseDate` and `showTimes` (generic strings).
    // The prompt says "movies along with their showtimes... that are created on that date".
    // This implies we might need to filter by `releaseDate` if "created on that date" means "release date IS that date".
    // OR it means we need to check if the movie 'playing' on that date.
    // Given the simple schema: `releaseDate` and `status: Now Showing`, and generic `showTimes`.
    // I will assume for now we filter by `releaseDate` matching the query date OR just return all 'Now Showing' if no specific date logic exists in DB yet.
    // But the prompt says "created on that date". Let's stick to `releaseDate` for now as a filter if provided.
    
    // Actually, looking at the schema, `releaseDate` is a single Date.
    // If the user wants to see what's playing on specific dates (like a calendar), 
    // usually there's a separate `Showtime` model linking Movie, Screen, and DateTime.
    // But here we only have `Movie` with `screen` and `showTimes` array. 
    // This implies a Movie entry IS a schedule entry effectively? 
    // "when assigning a movie to a sreen.. check if there is a show at the same exact date and time"
    // This strongly suggests each `Movie` document represents a specific scheduling instance 
    // OR we are missing a `Show` model.
    // The `Movie` model has `screen` and `showTimes`. If `Movie` is just metadata, it shouldn't have `screen` directly unless it's a 1:1 mapping (1 movie : 1 screen).
    // But `showTimes` is an array.
    // If a Movie runs for a week, how do we know which date?
    // The `releaseDate` might be acting as the "Show Date" in this simplified app?
    // Let's assume `releaseDate` IS the "Show Date" for this purpose based on "created on that date".
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.releaseDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const movies = await Movie.find(query);
  res.json(movies);
};

// ... (getMovieById remains same) ...
const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  const { title, description, posterUrl, trailerUrl, genre, duration, releaseDate, language, cast, status, screen, showTimes } = req.body;

  // Conflict Check
  if (status === 'Now Showing' && screen && showTimes && showTimes.length > 0 && releaseDate) {
    const startOfDay = new Date(releaseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(releaseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingMovies = await Movie.find({
      screen: screen,
      releaseDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'Now Showing'
    });

    for (const existingMovie of conflictingMovies) {
      const existingTimes = existingMovie.showTimes || [];
      const newTimes = showTimes || [];
      
      const intersection = newTimes.filter(time => existingTimes.includes(time));
      if (intersection.length > 0) {
        return res.status(400).json({ 
          message: `Conflict! Show at ${intersection.join(', ')} is already booked on ${screen} for this date.` 
        });
      }
    }
  }

  const movie = new Movie({
    title,
    description,
    posterUrl,
    trailerUrl,
    genre,
    duration,
    releaseDate,
    language,
    cast,
    status,
    screen,
    showTimes,
  });

  const createdMovie = await movie.save();
  res.status(201).json(createdMovie);
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  const { title, description, posterUrl, trailerUrl, genre, duration, releaseDate, language, cast, status, screen, showTimes } = req.body;

  const movie = await Movie.findById(req.params.id);

  if (movie) {
    // Conflict Check (if changing relevant fields)
    const newScreen = screen || movie.screen;
    const newShowTimes = showTimes || movie.showTimes;
    const newReleaseDate = releaseDate || movie.releaseDate;
    const newStatus = status || movie.status;

    if (newStatus === 'Now Showing' && newScreen && newShowTimes && newShowTimes.length > 0 && newReleaseDate) {
       const startOfDay = new Date(newReleaseDate);
       startOfDay.setHours(0, 0, 0, 0);
       const endOfDay = new Date(newReleaseDate);
       endOfDay.setHours(23, 59, 59, 999);
   
       const conflictingMovies = await Movie.find({
         _id: { $ne: movie._id }, // Exclude current movie
         screen: newScreen,
         releaseDate: {
           $gte: startOfDay,
           $lte: endOfDay
         },
         status: 'Now Showing'
       });
   
       for (const existingMovie of conflictingMovies) {
         const existingTimes = existingMovie.showTimes || [];
         
         const intersection = newShowTimes.filter(time => existingTimes.includes(time));
         if (intersection.length > 0) {
           return res.status(400).json({ 
             message: `Conflict! Show at ${intersection.join(', ')} is already booked on ${newScreen} for this date.` 
           });
         }
       }
    }

    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.posterUrl = posterUrl || movie.posterUrl;
    movie.trailerUrl = trailerUrl || movie.trailerUrl;
    movie.genre = genre || movie.genre;
    movie.duration = duration || movie.duration;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.language = language || movie.language;
    movie.cast = cast || movie.cast;
    movie.status = status || movie.status;
    movie.screen = screen || movie.screen;
    movie.showTimes = showTimes || movie.showTimes;

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    await movie.deleteOne();
    res.json({ message: 'Movie removed' });
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
