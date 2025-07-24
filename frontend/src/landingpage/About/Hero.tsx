import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-32 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
        </div>

        {/* Particle Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        {/* Floating Books Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-float">
            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-blue-200/20 backdrop-blur-sm rounded-lg flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-700">
              <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 animate-float animation-delay-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-200/20 to-pink-200/20 backdrop-blur-sm rounded-lg flex items-center justify-center -rotate-12 hover:rotate-0 transition-transform duration-700">
              <svg className="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 animate-float animation-delay-2000">
            <div className="w-14 h-14 bg-gradient-to-br from-green-200/20 to-cyan-200/20 backdrop-blur-sm rounded-lg flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-700">
              <svg className="w-7 h-7 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center">
              {/* Logo/Icon with enhanced animation */}
              <div className="mb-8 inline-flex items-center justify-center animate-fadeInUp">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 backdrop-blur-sm border border-white/20">
                    <svg className="w-14 h-14 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main Heading with typing effect */}
              <div className="mb-6 animate-fadeInUp animation-delay-200">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  <span className="inline-block hover:animate-bounce transition-all duration-300">Discover</span>{' '}
                  <span className="inline-block hover:animate-bounce transition-all duration-300 animation-delay-100">Your</span>{' '}
                  <span className="inline-block hover:animate-bounce transition-all duration-300 animation-delay-200">Next</span>
                  <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                    Great Read
                  </span>
                </h1>
              </div>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-blue-100/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fadeInUp animation-delay-400 backdrop-blur-sm">
                Join our vibrant community of book enthusiasts. Share authentic reviews, discover incredible authors, 
                and find books that will transform your perspective and ignite your imagination.
              </p>

              {/* Enhanced Stats */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16 animate-fadeInUp animation-delay-600">
                {[
                  { number: '1,500+', label: 'Books', icon: '📚', color: 'from-blue-400 to-cyan-400' },
                  { number: '5,000+', label: 'Reviews', icon: '⭐', color: 'from-purple-400 to-pink-400' },
                  { number: '1,200+', label: 'Readers', icon: '👥', color: 'from-green-400 to-blue-400' }
                ].map((stat, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative">
                      <div className={`absolute -inset-2 bg-gradient-to-r ${stat.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                      <div className="relative text-center bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                        <div className="text-blue-200/80 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fadeInUp animation-delay-800">
                <Link
                  to="/books"
                  className="group relative inline-flex items-center space-x-3 bg-white text-slate-900 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="relative z-10">Explore Books</span>
                  <svg className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>

                {!user ? (
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10 text-white font-bold drop-shadow-sm">Join Community</span>
                    <svg className="relative z-10 w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    to="/add-book"
                    className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10 text-white font-bold drop-shadow-sm">Add a Book</span>
                    <svg className="relative z-10 w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Enhanced Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fadeInUp animation-delay-1000">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: 'Curated Reviews',
                    description: 'Read authentic, thoughtful reviews from passionate book enthusiasts worldwide',
                    gradient: 'from-blue-500 to-cyan-600',
                    delay: '0'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    ),
                    title: 'Share & Rate',
                    description: 'Express your literary thoughts and rate books with our intuitive 5-star system',
                    gradient: 'from-purple-500 to-pink-600',
                    delay: '200'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    ),
                    title: 'Discover More',
                    description: 'Uncover hidden gems through AI-powered recommendations tailored to your taste',
                    gradient: 'from-pink-500 to-red-600',
                    delay: '400'
                  }
                ].map((feature, index) => (
                  <div key={index} className={`group cursor-pointer animate-fadeInUp animation-delay-${feature.delay}`}>
                    <div className="relative h-full">
                      <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                      <div className="relative h-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-blue-200/80 leading-relaxed group-hover:text-blue-100/90 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-all duration-300">
              <svg className="w-6 h-6 text-white/80 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          33% { 
            transform: translateY(-20px) rotate(2deg) scale(1.05); 
          }
          66% { 
            transform: translateY(10px) rotate(-2deg) scale(0.95); 
          }
        }
        
        @keyframes blob {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1); 
          }
          33% { 
            transform: translate(30px, -50px) scale(1.1); 
          }
          66% { 
            transform: translate(-20px, 20px) scale(0.9); 
          }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.5); 
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 4s ease-in-out infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.4);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom backdrop blur for better browser support */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </>
  );
};

export default Hero;