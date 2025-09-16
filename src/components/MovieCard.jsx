import React, { useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_TOKEN = import.meta.env.VITE_TMDB_API_KEY;

const fetchTrailer = async (movieId) => {
  console.log("Fetching trailer for movie ID:", movieId);

  try {
    const res = await fetch(`${API_BASE_URL}/movie/${movieId}/videos?language=en-US`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("TMDB fetch failed:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log(`TMDB videos for movie ${movieId}:`, data.results);

    if (!data.results || data.results.length === 0) return null;

    let trailer = data.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer" && vid.key
    );

    if (!trailer) {
      trailer = data.results.find((vid) => vid.site === "YouTube" && vid.key);
    }

    if (!trailer) {
      console.warn("No valid YouTube trailer found.");
      return null;
    }

    console.log("Found trailer key:", trailer.key);
    return trailer.key;
  } catch (err) {
    console.error("Error fetching trailer:", err);
    return null;
  }
};

const MovieCard = ({ movie, index, hoveredIndex, onMouseEnter, onMouseLeave }) => {
  const { id, title, vote_average, poster_path, release_date, original_language } = movie;

  const [trailerKey, setTrailerKey] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerUnavailable, setTrailerUnavailable] = useState(false);

  const handlePlayTrailer = async () => {
    setModalVisible(true);

    if (!trailerKey && !trailerUnavailable) {
      setLoadingTrailer(true);
      const key = await fetchTrailer(id);
      setLoadingTrailer(false);

      if (!key) {
        setTrailerUnavailable(true);
        return;
      }

      setTrailerKey(key);
    }
  };

  const handleCloseTrailer = () => {
    setModalVisible(false);
  };

  let scale = 1;
  let translateX = 0;
  if (hoveredIndex !== null) {
    const distance = index - hoveredIndex;
    const distanceFactor = Math.min(Math.abs(distance), 4);
    translateX = Math.sign(distance) * Math.pow(distanceFactor, 1.5) * 5;
    scale = distance === 0 ? 1.1 : 1 - distanceFactor * 0.01 + 0.01;
  }

  return (
    <div
      className="movie-card group cursor-pointer hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 ease-out"
      style={{ transform: `translateX(${translateX}px) scale(${scale})`, zIndex: hoveredIndex === index ? 20 : 10 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img
            loading="lazy"
            src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : "/No-Poster.png"}
            alt={title}
            className="rounded-lg transform transition-transform duration-300 ease-out"
          />


        <button
          onClick={handlePlayTrailer}
          className={`absolute inset-0 flex items-center justify-center
                     bg-black/60 text-white font-semibold text-lg transition-all duration-300 ease-out
                     ${loadingTrailer ? "opacity-100 scale-100" : "opacity-0 scale-90"}
                     group-hover:opacity-100 group-hover:scale-100`}
        >
          {loadingTrailer ? "Loading..." : "▶ Play Trailer"}
        </button>

        {trailerUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white font-semibold text-sm rounded-lg">
            Trailer not available
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-white font-bold text-base line-clamp-1">{title}</h3>
        <div className="flex flex-row items-center flex-wrap gap-2 mt-2 text-gray-300 text-sm">
          <div className="flex items-center gap-1">
            <img src="star.svg" alt="star icon" className="w-4 h-4" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="capitalize">{original_language}</p>
          <span>•</span>
          <p>{release_date ? release_date.split("-")[0] : "N/A"}</p>
        </div>
      </div>

      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
          onClick={handleCloseTrailer}
          role="dialog"
          tabIndex={-1}
        >
          <div className="bg-black rounded-lg p-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video w-full">
              {trailerKey ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1`}
                  title="YouTube trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              ) : (
                <p className="text-white text-center">Loading trailer...</p>
              )}
            </div>
            <button
              onClick={handleCloseTrailer}
              className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
