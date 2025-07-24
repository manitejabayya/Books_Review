import React from 'react';
import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/books/${book._id}`);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Book Cover Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-lg">
            {book.title}
          </h3>
        </div>
        {/* Floating rating badge */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <RatingStars rating={book.averageRating || 0} size="sm" />
            <span className="text-xs font-semibold text-gray-700">
              {book.averageRating ? book.averageRating.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Author */}
        <p className="text-gray-600 font-medium mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          by {book.author}
        </p>

        {/* Genre */}
        <div className="mb-4">
          <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
            {book.genre}
          </span>
        </div>

        {/* Reviews count */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {book.reviewCount || 0} reviews
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-blue-600 text-sm font-medium">Read more →</span>
          </div>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default BookCard;