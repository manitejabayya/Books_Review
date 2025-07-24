import React, { useState } from 'react';

const RatingStars = ({ 
  rating = 0, 
  onRatingChange = null, 
  size = 'md', 
  readonly = false,
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex) => {
    const currentRating = hoverRating || rating;
    if (starIndex <= currentRating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            type="button"
            className={`${sizeClasses[size]} ${getStarColor(starIndex)} ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-all duration-200 focus:outline-none`}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="drop-shadow-sm"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2 font-medium">
          {rating > 0 ? rating.toFixed(1) : 'No rating'}
        </span>
      )}
      
      {!readonly && hoverRating > 0 && (
        <span className="text-sm text-gray-500 ml-2 animate-pulse">
          {hoverRating} star{hoverRating !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default RatingStars;