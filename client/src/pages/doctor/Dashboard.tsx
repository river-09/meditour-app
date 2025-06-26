import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';

interface DashboardStats {
  reviewRequests: number;
  appointments: number;
  upcomingCalls: number;
  patients: number;
}

interface DoctorProfile {
  fullName: string;
  specialization: string;
  isProfileComplete: boolean;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<DashboardStats>({
    reviewRequests: 0,
    appointments: 0,
    upcomingCalls: 0,
    patients: 0
  });
  
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    fullName: user?.fullName || 'Doctor',
    specialization: '',
    isProfileComplete: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        reviewResponse,
        appointmentsResponse,
        upcomingResponse,
        patientsResponse,
        profileResponse
      ] = await Promise.all([
        authenticatedFetch(`/api/review-requests/stats/${userId}`),
        authenticatedFetch(`/api/appointments/doctor/${userId}/stats`),
        authenticatedFetch(`/api/appointments/doctor/${userId}/upcoming`),
        authenticatedFetch(`/api/appointments/doctor/${userId}/patients-count`),
        authenticatedFetch(`/api/doctor/profile`)
      ]);

      // Process responses
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        setStats(prev => ({ ...prev, reviewRequests: reviewData.pending || 0 }));
      }

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setStats(prev => ({ ...prev, appointments: appointmentsData.total || 0 }));
      }

      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        setStats(prev => ({ ...prev, upcomingCalls: upcomingData.total || 0 }));
      }

      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setStats(prev => ({ ...prev, patients: patientsData.uniquePatients || 0 }));
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setDoctorProfile({
          fullName: profileData.fullName || user?.fullName || 'Doctor',
          specialization: profileData.specialization || '',
          isProfileComplete: profileData.isProfileComplete || false
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (link: string) => {
    window.location.href = link;
  };

  const cards = [
    {
      title: 'Review Requests',
      count: stats.reviewRequests,
      buttonText: 'View Requests',
      link: '/doctor/review-requests',
      icon: '📋'
    },
    {
      title: 'Appointments',
      count: stats.appointments,
      buttonText: 'View Appointments',
      link: '/doctor/appointments',
      icon: '📅'
    },
    {
      title: 'Upcoming Calls',
      count: stats.upcomingCalls,
      buttonText: 'Join Call',
      link: '/doctor/upcoming-calls',
      icon: '📞'
    },
    {
      title: 'Your Patients',
      count: stats.patients,
      buttonText: 'View Patients',
      link: '/doctor/patients',
      icon: '👥'
    },
    {
      title: 'Profile Setup',
      count: doctorProfile.isProfileComplete ? '✓' : '!',
      buttonText: doctorProfile.isProfileComplete ? 'Edit Profile' : 'Setup Profile',
      link: '/doctor/setup-profile',
      icon: '⚙️'
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-600 text-lg">Welcome, {doctorProfile.fullName}</p>
            {doctorProfile.specialization && (
              <p className="text-gray-500 text-sm">{doctorProfile.specialization}</p>
            )}
          </div>
          <button
            onClick={() => handleCardClick('/doctor/profile')}
            className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
          >
            👤
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Manage your appointments, review patient requests, and conduct video consultations
          </p>
          {!doctorProfile.isProfileComplete && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Please complete your profile setup to start receiving patient requests
              </p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 text-center flex flex-col items-center hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleCardClick(card.link)}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-green-800 mb-4">{card.count}</p>
              <button
                className="bg-green-600  btn-medigreen text-white w-full py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(card.link);
                }}
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