import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';

interface DashboardStats {
  reviewRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  upcomingCalls: {
    count: number;
  };
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
  highlight?: boolean;
}

const PatientDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { authenticatedFetch, userId } = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<DashboardStats>({
    reviewRequests: { pending: 0, approved: 0, rejected: 0, total: 0 },
    upcomingCalls: { count: 0 }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardStats();
    }
  }, [userId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch review request stats
      const reviewResponse = await authenticatedFetch(`/api/patient/review-requests/${userId}`);
      let reviewStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
      
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        if (reviewData.success && reviewData.requests) {
          reviewData.requests.forEach((request: any) => {
            if (request.status === 'pending') reviewStats.pending++;
            if (request.status === 'approved') reviewStats.approved++;
            if (request.status === 'rejected') reviewStats.rejected++;
            reviewStats.total++;
          });
        }
      }

      // Fetch upcoming calls count only
      const callsResponse = await authenticatedFetch(`/api/patient/upcoming-calls/${userId}`);
      let callsStats = { count: 0 };
      
      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        if (callsData.success && callsData.calls) {
          callsStats = {
            count: callsData.calls.length
          };
        }
      }

      setStats({
        reviewRequests: reviewStats,
        upcomingCalls: callsStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Set Up Medical Profile',
      description: 'Complete your medical information for better care',
      icon: '👤',
      action: () => navigate('/patient/setup-profile'),
      color: 'border-green-200 hover:border-green-300',
      highlight: true
    },
    {
      title: 'Find Specialists',
      description: 'Search and connect with medical specialists',
      icon: '🔍',
      action: () => navigate('/patient/find-doctors'),
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      title: 'My Appointments',
      description: 'View and manage your upcoming appointments',
      icon: '📅',
      action: () => navigate('/patient/appointments'),
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      title: 'Upcoming Calls',
      description: 'Join your scheduled video consultations',
      icon: '📞',
      action: () => navigate('/patient/upcoming-calls'),
      color: 'border-gray-200 hover:border-gray-300'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img src={logo} alt="MedTour" className="h-10 w-10 rounded-full" />
                <span className="text-xl font-bold text-gray-900">MedTour</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Patient
                </span>
              </div>
              <UserButton afterSignOutUrl="/auth/signin" />
            </div>
          </div>
        </nav>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="MedTour" className="h-10 w-10 rounded-full" />
              <span className="text-xl font-bold text-gray-900">MedTour</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Patient
              </span>
            </div>
            <UserButton afterSignOutUrl="/auth/signin" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName || 'Patient'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your health appointments and connect with medical specialists
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className={`bg-white rounded-lg border-2 ${action.color} p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                action.highlight ? 'ring-2 ring-green-200' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Request Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Review Request Status</h2>
              <button
                onClick={() => navigate('/patient/find-doctors')}
                className="btn-medigreen text-sm px-3 py-1"
              >
                Send New Request
              </button>
            </div>
            
            {stats.reviewRequests.total === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📋</div>
                <p className="text-gray-600">No review requests yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Send requests to doctors for medical consultations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.reviewRequests.pending}
                    </div>
                    <div className="text-sm text-yellow-700">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.reviewRequests.approved}
                    </div>
                    <div className="text-sm text-green-700">Approved</div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Total Requests: {stats.reviewRequests.total}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Video Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Video Calls</h2>
              <button
                onClick={() => navigate('/patient/upcoming-calls')}
                className="btn-medigreen text-sm px-3 py-1"
              >
                View All
              </button>
            </div>
            
            {stats.upcomingCalls.count === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📞</div>
                <p className="text-gray-600">No upcoming calls</p>
                <p className="text-sm text-gray-500 mt-1">
                  Approved appointments will appear here when scheduled
                </p>
              </div>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.upcomingCalls.count}
                </div>
                <div className="text-sm text-blue-700">Scheduled Video Calls</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
