import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './landingpage/Navbar';
import Footer from './landingpage/Footer';
import Hero from './landingpage/About/Hero';
import About from './landingpage/About/About';
import Login from './landingpage/Auth/Login';
import Signup from './landingpage/Auth/Signup';
import Unauthorized from './landingpage/Auth/Unauthorized';
import BookList from './landingpage/Home/BookList';
import BookDetail from './landingpage/Home/BookDetail';
import AddBook from './landingpage/Home/AddBook';
import FooterAbout from './landingpage/FooterElements/About';
import FooterContact from './landingpage/FooterElements/Contact';

// Protected Route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/unauthorized" />;
}

function App() {
  const { user, logout } = useAuth();
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {user && (
          <button
            style={{ position: "absolute", top: 16, right: 16, zIndex: 1000 }}
            onClick={logout}
          >
            Logout
          </button>
        )}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/about" element={<About />} />
            <Route path="/footer-about" element={<FooterAbout />} />
            <Route path="/footer-contact" element={<FooterContact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/add-book" element={
              <PrivateRoute>
                <AddBook />
              </PrivateRoute>
            } />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
