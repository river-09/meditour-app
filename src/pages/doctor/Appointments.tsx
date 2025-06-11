// src/pages/doctor/Appointments.tsx
import React from 'react';
import logo from '../../assets/logo.jpg';

const Appointments: React.FC = () => {
  const appointments = [
    { patientName: 'John Doe', date: '2024-06-12', time: '10:30 AM' },
    { patientName: 'Jane Smith', date: '2024-06-13', time: '2:00 PM' },
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
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Appointments</h2>
        <ul className="space-y-3">
          {appointments.map((appt, idx) => (
            <li key={idx} className="bg-white p-4 rounded shadow">
              <p className="font-semibold text-gray-800">{appt.patientName}</p>
              <p className="text-gray-600">Date: {appt.date} | Time: {appt.time}</p>
              <button className="btn-medigreen">
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Appointments;
