import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Login from '../components/Login';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="border border-gray-200 px-8 py-10 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-black mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your HomeSplit account</p>
            </div>

            <Login
              onSwitchToRegister={handleSwitchToRegister}
              onLoginSuccess={handleLoginSuccess}
            />

            <div className="mt-8 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="text-black hover:underline font-medium transition-all"
              >
                Create one here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
