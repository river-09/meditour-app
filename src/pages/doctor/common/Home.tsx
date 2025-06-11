import React from 'react';
import logo from '../../../assets/logo.jpg';

const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <img
          src={logo}
          alt="MedTour Logo"
          className="w-14 h-14 rounded-full object-cover"
        />
        <h1 className="text-4xl font-bold text-gray-800">MedTour</h1>
      </div>
      
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to MedTour</h2>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Your trusted global platform for finding specialists, sharing reports, and planning medical journeys seamlessly.
        </p>
      </div>
      
      {/* Choose Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Patient card */}
        <div className="btn-medigreen-light rounded-2xl shadow-lg p-6 text-center flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient</h3>
          <p className="text-gray-600 mb-6">Fill medical details, upload reports, and connect with top specialists worldwide.</p>
          <button
            className="btn-medigreen"
            onClick={() => window.location.href = '/login/patient'}
          >
            Login as Patient
          </button>
        </div>
        
        {/* Doctor card */}
        <div className="btn-medigreen-light rounded-2xl shadow-lg p-6 text-center flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Doctor</h3>
          <p className="text-gray-600 mb-6">Access patient requests, review medical files, and schedule consultations.</p>
          <button
            className="btn-medigreen"
            onClick={() => window.location.href = '/login/doctor'}
          >
            Login as Doctor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;