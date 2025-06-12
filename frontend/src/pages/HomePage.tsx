import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const isAuthenticated = Boolean(sessionStorage.getItem('access_token'));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="max-w-4xl mx-auto fade-in">
            <h1 className="text-5xl md:text-7xl font-light text-black leading-tight mb-6 tracking-tight">
              Simplify Your
              <span className="block font-normal">Household Life</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Split expenses effortlessly, manage shopping lists together, and keep track of
              household tasks - all in one clean, minimalist interface.
            </p>

            {isAuthenticated ? (
              <div className="justify-center my-24">
                <Link to="/dashboard">
                  <Button size="lg" className="px-12 py-4 text-lg font-medium">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center my-24">
                <Link to="/register">
                  <Button size="lg" className="px-12 py-4 text-lg font-medium">
                    Start Managing Today
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-12 py-4 text-lg font-medium">
                    I Have an Account
                  </Button>
                </Link>
              </div>
            )}

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-12 mt-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-sm flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.25}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-black mb-4">Settle Up</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  Split expenses fairly and track who owes what. Automatically calculate bills,
                  rent, and shared costs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-sm flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-black mb-4">Shopping Lists</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  Create shared shopping lists that sync in real-time. Never forget what you need to
                  buy again.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-sm flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-black mb-4">To-Do Lists</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  Organize household tasks and keep everyone accountable. Assign chores and track
                  completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
