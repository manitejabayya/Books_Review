import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/Authcontext";

const BookList = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    author: '',
    sortBy: 'newest'
  });
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockBooks = [
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genre: "Classic Literature",
          averageRating: 4.2,
          reviewCount: 156,
          dateAdded: "2024-01-15",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"
        },
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Classic Literature",
          averageRating: 4.8,
          reviewCount: 203,
          dateAdded: "2024-02-10",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop"
        },
        {
          id: 3,
          title: "1984",
          author: "George Orwell",
          genre: "Dystopian Fiction",
          averageRating: 4.5,
          reviewCount: 178,
          dateAdded: "2024-01-28",
          coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop"
        },
        {
          id: 4,
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          genre: "Coming of Age",
          averageRating: 3.9,
          reviewCount: 142,
          dateAdded: "2024-02-05",
          coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop"
        },
        {
          id: 5,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          genre: "Romance",
          averageRating: 4.6,
          reviewCount: 234,
          dateAdded: "2024-01-20",
          coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop"
        },
        {
          id: 6,
          title: "The Lord of the Rings",
          author: "J.R.R. Tolkien",
          genre: "Fantasy",
          averageRating: 4.9,
          reviewCount: 312,
          dateAdded: "2024-02-12",
          coverImage: "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop"
        }
      ];

      setBooks(mockBooks);
      setGenres([...new Set(mockBooks.map(book => book.genre))]);
      setAuthors([...new Set(mockBooks.map(book => book.author))]);
      setTotalPages(2);
      setLoading(false);
    }, 1000);
  }, [currentPage, filters]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ genre: '', author: '', sortBy: 'newest' });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Discover Amazing Books
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of books and find your next great read
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Genre Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Author</label>
                <select
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Authors</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating-high">Highest Rated</option>
                  <option value="rating-low">Lowest Rated</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-red-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200"
            >
              <div className="relative">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <span className="text-sm font-semibold text-gray-800">{book.averageRating}</span>
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full">
                    {book.genre}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {book.title}
                </h3>

                <p className="text-gray-600 mb-4">by {book.author}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(book.averageRating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({book.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <Link
                  to={`/book/${book.id}`}
                  className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === index + 1
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>

        {/* Add Book CTA for logged-in users */}
        {user && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Have a book recommendation?
              </h2>
              <p className="text-blue-100 mb-6">
                Share your favorite books with the community and help others discover amazing reads!
              </p>
              <Link
                to="/add-book"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add a Book</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;