// src/pages/doctor/ReviewRequests.tsx
import React from 'react';
import logo from '../../assets/logo.jpg';

const ReviewRequests: React.FC = () => {
  const requests = [
    { patientName: 'John Doe', condition: 'Cardiology', submittedOn: '2024-06-10' },
    { patientName: 'Jane Smith', condition: 'Orthopedics', submittedOn: '2024-06-09' },
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
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Review Requests</h2>
        <div className="space-y-4">
          {requests.map((req, idx) => (
            <div key={idx} className="bg-white shadow rounded-lg p-4">
              <p className="font-medium text-gray-800">Patient: {req.patientName}</p>
              <p className="text-gray-600">Condition: {req.condition}</p>
              <p className="text-sm text-gray-500">Submitted: {req.submittedOn}</p>
              <button className="btn-medigreen">
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewRequests;
