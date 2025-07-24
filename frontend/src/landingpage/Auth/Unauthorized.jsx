import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-700 text-lg mb-6">
        You don't have permission to access this page.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;