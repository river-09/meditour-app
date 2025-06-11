// src/pages/doctor/Patients.tsx
import React from 'react';
import logo from '../../assets/logo.jpg';

const Patients: React.FC = () => {
  const patients = [
    { name: 'Anita Sharma', condition: 'Diabetes' },
    { name: 'Ravi Kumar', condition: 'Hypertension' },
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
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Patients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {patients.map((pat, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold text-gray-800">{pat.name}</h3>
              <p className="text-gray-600">Condition: {pat.condition}</p>
              <button className="btn-medigreen">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Patients;
