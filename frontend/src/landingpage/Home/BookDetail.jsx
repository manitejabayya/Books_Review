import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import api from '../../services/api';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: '',
    isSubmitting: false
  });
  const [reviewsPage, setReviewsPage] = useState(1);
  const reviewsPerPage = 5;

  // Fetch book and reviews from backend
  useEffect(() => {
    const fetchBookAndReviews = async () => {
      setLoading(true);
      try {
        // Fetch book details
        const bookRes = await api.get(`/books/${id}`);
        setBook(bookRes.data.data?.book || bookRes.data.book || bookRes.data);
        // Fetch reviews for this book
        const reviewsRes = await api.get(`/books/${id}/reviews`, {
          params: { page: reviewsPage, limit: reviewsPerPage }
        });
        setReviews(reviewsRes.data.data?.reviews || reviewsRes.data.reviews || reviewsRes.data);
      } catch (err) {
        setBook(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndReviews();
    // eslint-disable-next-line
  }, [id, reviewsPage]);

  const renderStars = (rating, size = 'w-5 h-5', interactive = false, onStarClick = null) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onStarClick(i) : undefined}
          className={`${size} ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''} transition-colors duration-200`}
          disabled={!interactive}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <svg fill={i <= rating ? '#facc15' : '#d1d5db'} viewBox="0 0 20 20" className="w-full h-full">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      );
    }
    
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to write a review');
      return;
    }
    if (reviewForm.reviewText.trim().length < 10) {
      alert('Review must be at least 10 characters.');
      return;
    }
    setReviewForm(prev => ({ ...prev, isSubmitting: true }));
    try {
      // Log the review payload for debugging
      console.log("Submitting review:", {
        rating: reviewForm.rating,
        reviewText: reviewForm.reviewText
      });
      // Submit review to backend
      await api.post(`/books/${id}/reviews`, {
        rating: reviewForm.rating,
        reviewText: reviewForm.reviewText
      });
      // Refetch reviews and book details
      const [bookRes, reviewsRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/books/${id}/reviews`, { params: { page: 1, limit: reviewsPerPage } })
      ]);
      setBook(bookRes.data.data?.book || bookRes.data.book || bookRes.data);
      setReviews(reviewsRes.data.data?.reviews || reviewsRes.data.reviews || reviewsRes.data);
      setReviewForm({ rating: 5, reviewText: '', isSubmitting: false });
      setShowReviewForm(false);
      setReviewsPage(1);
      alert('Review submitted successfully!');
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const paginatedReviews = reviews.slice(
    (reviewsPage - 1) * reviewsPerPage,
    reviewsPage * reviewsPerPage
  );

  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Book Not Found</h1>
          <p className="text-gray-600 mb-6">The book you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Books</span>
        </button>

        {/* Book Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(book.averageRating)}
                    <span className="text-lg font-semibold text-gray-800">
                      {book.averageRating}
                    </span>
                  </div>
                  <p className="text-gray-600 text-center">
                    {book.reviewCount} reviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full mb-4">
                  {book.genre}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  by {book.author}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                  <span>Added by {book.addedBy}</span>
                  <span>•</span>
                  <span>Added on {formatDate(book.dateAdded)}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                {user ? (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Write a Review</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Login to Write a Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && user && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Write Your Review</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Rating
                  </label>
                  {renderStars(
                    reviewForm.rating,
                    'w-8 h-8',
                    true,
                    (rating) => setReviewForm(prev => ({ ...prev, rating }))
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="reviewText" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    id="reviewText"
                    value={reviewForm.reviewText}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                    rows={4}
                    placeholder="Share your thoughts about this book..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={reviewForm.isSubmitting}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    {reviewForm.isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    disabled={reviewForm.isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Reviews ({reviews.length})
            </h2>
          </div>

          <div className="p-8">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share your thoughts about this book!</p>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Write the First Review
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedReviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start space-x-4">
                        {/* Reviewer Avatar: image if available, else text avatar */}
                        {review.reviewer?.profilePicture ? (
                          <img
                            src={review.reviewer.profilePicture}
                            alt={review.reviewer.username || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 text-xl font-bold text-gray-600">
                            {(review.reviewer?.firstName?.[0] || review.reviewer?.username?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {review.reviewer?.firstName || ''} {review.reviewer?.lastName || review.reviewer?.username || 'User'}
                              </h4>
                              <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                            </div>
                            {renderStars(review.rating, 'w-4 h-4')}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reviews Pagination */}
                {totalReviewPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setReviewsPage(prev => Math.max(prev - 1, 1))}
                      disabled={reviewsPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Previous
                    </button>

                    {[...Array(totalReviewPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setReviewsPage(index + 1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          reviewsPage === index + 1
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setReviewsPage(prev => Math.min(prev + 1, totalReviewPages))}
                      disabled={reviewsPage === totalReviewPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;