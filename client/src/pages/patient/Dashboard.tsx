import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const PatientDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check profile completion status
  const checkProfileStatus = async () => {
    try {
      if (user?.id) {
        const response = await fetch(`http://localhost:3000/api/patient/profile-status/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsProfileComplete(data.isComplete || false);
        }
      }
    } catch (error) {
      console.log('Error checking profile status:', error);
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkProfileStatus();
    }
  }, [user]);

  // Listen for storage events and visibility changes to update profile status
  useEffect(() => {
    const handleStatusUpdate = () => {
      if (user?.id) {
        checkProfileStatus();
      }
    };

    // Check when component becomes visible (user returns to tab/page)
    document.addEventListener('visibilitychange', handleStatusUpdate);
    
    // Check when window gains focus
    window.addEventListener('focus', handleStatusUpdate);
    
    // Custom event listener for profile updates
    window.addEventListener('profileUpdated', handleStatusUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleStatusUpdate);
      window.removeEventListener('focus', handleStatusUpdate);
      window.removeEventListener('profileUpdated', handleStatusUpdate);
    };
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const quickActions = [
    {
      title: isProfileComplete ? "View Medical Profile" : "Set Up Medical Profile",
      description: isProfileComplete 
        ? "View and update your medical information" 
        : "Complete your medical information for better care",
      action: () => navigate('/patient/setup-profile'),
      icon: "👤",
      isCompleted: isProfileComplete
    },
    {
      title: "Find Specialists",
      description: "Search and connect with medical specialists",
      action: () => navigate('/patient/find-doctors'),
      icon: "🔍"
    },
    {
      title: "My Appointments",
      description: "View and manage your upcoming appointments",
      action: () => navigate('/patient/appointments'),
      icon: "📅"
    },
    {
      title: "Medical Records",
      description: "Access your medical history and reports",
      action: () => navigate('/patient/records'),
      icon: "📋"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="MedTour" className="h-10 w-10 rounded-full" />
              <span className="text-xl font-bold text-gray-900">MedTour</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Patient
              </span>
            </div>
            <UserButton afterSignOutUrl="/auth/signin" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
          </h1>
          <p className="text-gray-600">
            Manage your medical journey, connect with specialists, and take control of your health.
          </p>
        </div>

        {/* Profile Status Alert - Only show if profile is incomplete */}
        {!isProfileComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please complete your medical profile to get the best care from our specialists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className={`
                relative p-6 bg-white rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200
                ${index === 0 && !isProfileComplete ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
              `}
            >
              {/* Completion Status Indicator - Only show for profile setup when completed */}
              {index === 0 && isProfileComplete && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
                {index === 0 && isProfileComplete && (
                  <span className="ml-2 text-sm text-green-600 font-normal">✓ Complete</span>
                )}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>

              {/* Priority indicator for incomplete profile */}
              {index === 0 && !isProfileComplete && (
                <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Action Required
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Success Message for Completed Profile */}
        {isProfileComplete && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Profile Complete
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Your medical profile is complete! You can now access all features and find specialists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500 mb-2">No recent activity yet.</p>
            <p className="text-gray-400 text-sm">
              {isProfileComplete 
                ? "Start by finding specialists or booking appointments."
                : "Complete your medical profile to get started with finding specialists."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;