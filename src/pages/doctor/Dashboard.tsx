import React from 'react';
import logo from '../../assets/logo.jpg';
const DoctorDashboard: React.FC = () => {
  const cards = [
    {
      title: 'Review Requests',
      count: 12,
      buttonText: 'View Requests',
      link: '/doctor/review-requests',
    },
    {
      title: 'Appointments',
      count: 5,
      buttonText: 'View Appointments',
      link: '/doctor/appointments',
    },
    {
      title: 'Upcoming Calls',
      count: 3,
      buttonText: 'Join Call',
      link: '/doctor/upcoming-calls',
    },
    {
      title: 'Your Patients',
      count: 9,
      buttonText: 'View Patients',
      link: '/doctor/patients',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-100 ">
      {/* Top bar */}
      <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />

          <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
        </div>
        <p className="text-gray-600 text-lg">Welcome, Dr. Arjun</p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          {cards.map((card, idx) => (
            <div
            key={idx}
            className="btn-medigreen-light rounded-2xl shadow-lg p-6 text-center flex flex-col items-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-green-800 mb-4">{card.count}</p>
              <button
                className="btn-medigreen"
                onClick={() => window.location.href = card.link}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
