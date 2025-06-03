import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Register from '../components/Register';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/dashboard');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-black mb-2">Join HomeSplit</h2>
              <p className="text-gray-600">Create your account and start managing your household</p>
            </div>
            
            <Register 
              onSwitchToLogin={handleSwitchToLogin}
              onRegisterSuccess={handleRegisterSuccess}
            />

            <div className="mt-8 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-black hover:underline font-medium transition-all">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
