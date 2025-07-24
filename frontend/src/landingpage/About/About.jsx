import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';

const About = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      title: "Extensive Library",
      description: "Browse through thousands of books across all genres, from classic literature to contemporary fiction, non-fiction, and specialized topics."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      title: "Smart Rating System",
      description: "Our 5-star rating system with detailed reviews helps you make informed decisions about your next read based on community feedback."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      title: "Active Community",
      description: "Connect with fellow book lovers, share recommendations, and engage in meaningful discussions about your favorite reads."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      title: "Easy Book Sharing",
      description: "Add your favorite books to our platform with detailed information, cover images, and personal recommendations for others to discover."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Advanced Filtering",
      description: "Find exactly what you're looking for with our advanced search and filtering options by genre, author, rating, and publication date."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 00-.945 1.067c-.22.428-.337.873-.34 1.287a1.558 1.558 0 00.027.185c.061.368.293.698.627.89a1.5 1.5 0 001.422.083c.393-.182.685-.495.822-.88.138-.385.243-.804.32-1.225.155-.843.27-1.718.342-2.614.036-.456.056-.914.07-1.36.013-.434.022-.87.025-1.304a1 1 0 00-1-1h-1.5c-.56 0-1.072.24-1.427.627-.356.388-.521.9-.5 1.434.03.79.087 1.576.187 2.354.1.777.24 1.54.526 2.286.285.745.62 1.458 1.016 2.146.397.688.76 1.348 1.104 1.987.343.64.67 1.26.992 1.864.323.605.64 1.19.97 1.757.33.566.673 1.114 1.046 1.643a1 1 0 001.73-1.002 54.672 54.672 0 00-1.046-1.637 50.99 50.99 0 01-.97-1.752 52.927 52.927 0 01-1.002-1.877 50.4 50.4 0 01-1.104-2.005c-.354-.68-.717-1.34-1.102-2.002-.386-.662-.8-1.31-1.243-1.943a1 1 0 00-1.73 1.002c.445.634.87 1.29 1.275 1.96.405.67.79 1.35 1.165 2.038.375.69.74 1.39 1.095 2.097.354.708.698 1.424 1.032 2.146.334.722.658 1.45.972 2.183.314.733.618 1.472.912 2.215a1 1 0 001.894-.447c-.3-.943-.612-1.872-.936-2.79-.324-.918-.66-1.826-1.008-2.724-.348-.898-.708-1.786-1.08-2.664a38.616 38.616 0 00-1.202-2.666c-.3-.712-.572-1.43-.818-2.15-.246-.722-.466-1.448-.66-2.177-.194-.729-.36-1.462-.5-2.197-.14-.735-.252-1.472-.338-2.21-.085-.738-.143-1.477-.172-2.216-.03-.74-.032-1.48-.005-2.218a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      title: "Personalized Recommendations",
      description: "Get tailored book suggestions based on your reading history, preferences, and ratings to discover new favorites."
    }
  ];

  return (
    <div className="bg-white">
      <Hero title="About BookVerse" subtitle="Discover the story behind our passion for books" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Mission
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            At BookVerse, we believe in the transformative power of books. Our mission is to create a vibrant community where readers can discover, share, and celebrate literature in all its forms.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Why Choose BookVerse?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 text-center">
                      {feature.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;