// src/pages/doctor/UpcomingCalls.tsx
import React from 'react';
import logo from '../../assets/logo.jpg';

const UpcomingCalls: React.FC = () => {
  const calls = [
    { patientName: 'Alice Brown', time: '4:00 PM', date: '2024-06-11' },
    { patientName: 'David Lee', time: '11:00 AM', date: '2024-06-12' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
        </div>
        <p className="text-gray-600 text-lg">Welcome, Dr. Arjun</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Video Calls</h2>
        {calls.map((call, idx) => (
          <div key={idx} className="bg-white shadow p-4 rounded-lg mb-4">
            <p className="text-gray-800 font-medium">Patient: {call.patientName}</p>
            <p className="text-gray-600">Date: {call.date}, Time: {call.time}</p>
            <button className="btn-medigreen">
              Join Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingCalls;
