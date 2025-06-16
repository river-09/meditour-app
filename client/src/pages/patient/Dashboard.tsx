import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const PatientDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Set Up Profile',
      description: 'Complete your medical profile with health information',
      icon: '📋',
      onClick: () => navigate('/patient/setup-profile'),
      isHighlight: true,
    },
    {
      title: 'Find Specialists',
      description: 'Search and connect with medical specialists worldwide',
      icon: '🔍',
      onClick: () => navigate('/patient/find-specialists'),
    },
    {
      title: 'My Medical Records',
      description: 'Upload and manage your medical reports and documents',
      icon: '📄',
      onClick: () => navigate('/patient/medical-records'),
    },
    {
      title: 'Appointments',
      description: 'View and manage your upcoming appointments',
      icon: '📅',
      onClick: () => navigate('/patient/appointments'),
    },
    {
      title: 'Consultations',
      description: 'Join video calls and chat with your doctors',
      icon: 'ðŸ’¬',
      onClick: () => navigate('/patient/consultations'),
    },
    {
      title: 'Treatment Plans',
      description: 'Track your ongoing treatments and medications',
      icon: 'ðŸ’Š',
      onClick: () => navigate('/patient/treatment-plans'),
    },
    {
      title: 'Travel Planning',
      description: 'Plan your medical tourism journey',
      icon: 'âœˆï¸',
      onClick: () => navigate('/patient/travel-planning'),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Patient
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <p className="text-gray-600 text-lg">
            Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
          </p>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#00B16A] to-[#00B16A] rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Health Dashboard</h2>
          <p className="text-white text-lg">
            Manage your medical journey, connect with specialists, and take control of your health.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
            <div className="text-gray-600 text-sm">Upcoming Appointments</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">0</div>
            <div className="text-gray-600 text-sm">Active Treatments</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
            <div className="text-gray-600 text-sm">Medical Records</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
            <div className="text-gray-600 text-sm">Specialists Connected</div>
          </div>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300 hover:scale-[1.02] transform ${
                item.isHighlight ? 'ring-2 ring-green-500 ring-opacity-50' : ''
              }`}
              onClick={item.onClick}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    item.isHighlight ? 'text-green-700' : 'text-gray-800'
                  }`}>
                    {item.title}
                    {item.isHighlight && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Important
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">ðŸ“</div>
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by setting up your medical profile or finding specialists.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;