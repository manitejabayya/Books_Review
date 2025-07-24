import React from 'react';
import RatingStars from './RatingStars';

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {review.reviewer?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900">
              {review.reviewer?.name || 'Anonymous'}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex flex-col items-end">
          <RatingStars rating={review.rating} readonly size="sm" />
          <span className="text-xs text-gray-500 mt-1">
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        <p className="text-gray-700 leading-relaxed">
          {review.review_text}
        </p>
        
        {/* Bottom border with gradient */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Review</span>
            </div>
            
            {/* Helpful button (optional) */}
            <button className="text-xs text-gray-400 hover:text-blue-500 transition-colors duration-200 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.334a2 2 0 001.106 1.789L18 22h1a2 2 0 002-2v-5a2 2 0 00-2-2h-1l-9.894-4.94A2 2 0 006 10.333z" />
              </svg>
              <span>Helpful</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 hover:opacity-30 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default ReviewCard;