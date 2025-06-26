import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import VideoCall from '../../components/VideoCall';
import logo from '../../assets/logo.jpg';

interface UpcomingCall {
  _id: string;
  doctorName: string;
  patientName: string;
  scheduledDate: string;
  duration: number;
  status: string;
  consultationFee: number;
  dailyRoomUrl?: string;
  condition?: string;
}

const PatientUpcomingCalls: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { authenticatedFetch, userId } = useAuthenticatedFetch();
  
  const [calls, setCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<UpcomingCall | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUpcomingCalls();
    }
  }, [userId]);

  const fetchUpcomingCalls = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/patient/upcoming-calls/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      } else {
        console.error('Failed to fetch upcoming calls');
      }
    } catch (error) {
      console.error('Error fetching upcoming calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getTimeUntilCall = (scheduledDate: string) => {
    const now = new Date();
    const callTime = new Date(scheduledDate);
    const diff = callTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Available Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const canJoinCall = (call: UpcomingCall) => {
    const now = new Date();
    const callTime = new Date(call.scheduledDate);
    const timeDiff = callTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join 15 minutes before and during the call
    return minutesDiff <= 15 && minutesDiff >= -call.duration;
  };

  const handleJoinCall = async (call: UpcomingCall) => {
    try {
      console.log('🔍 Attempting to join call:', call._id);
      
      // Store patient name for video call
      if (user) {
        const patientName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                           user.emailAddresses[0]?.emailAddress || 'Patient';
        localStorage.setItem('patientName', patientName);
      }

      // Fetch room URL from server
      const response = await authenticatedFetch(`/api/appointments/${call._id}/join`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Room URL received:', data.roomUrl);
        setActiveCall({ ...call, dailyRoomUrl: data.roomUrl });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to join call:', errorData);
        alert(errorData.message || 'Unable to join call');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Failed to join video call');
    }
  };

  const handleLeaveCall = () => {
    console.log('🔄 Leaving call, returning to upcoming calls');
    setActiveCall(null);
    localStorage.removeItem('patientName');
    // Refresh the calls list
    fetchUpcomingCalls();
  };

  // If in active call, show video call component
  if (activeCall && activeCall.dailyRoomUrl) {
    return (
      <VideoCall
        roomUrl={activeCall.dailyRoomUrl}
        onLeave={handleLeaveCall}
        userType="patient"
        appointmentId={activeCall._id}
      />
    );
  }

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
            <p className="mt-4 text-gray-600">Loading upcoming calls...</p>
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
        <div className="mb-6">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="btn-medigreen font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Calls</h1>
          <p className="text-gray-600 mt-2">
            Join your scheduled video consultations with doctors.
          </p>
        </div>

        {/* Upcoming Calls List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📞</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No upcoming video calls scheduled
              </h3>
              <p className="text-gray-600 mb-6">
                Approved appointments will appear here when scheduled
              </p>
              <button
                onClick={() => navigate('/patient/find-doctors')}
                className="btn-medigreen font-medium"
              >
                Find Specialists
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {calls.map((call) => {
                const dateTime = formatDateTime(call.scheduledDate);
                const timeUntil = getTimeUntilCall(call.scheduledDate);
                const canJoin = canJoinCall(call);
                
                return (
                  <div key={call._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dr. {call.doctorName}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            Video Consultation
                          </span>
                          {canJoin && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-pulse">
                              🔴 Call Ready
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">📅 {dateTime.date}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">🕐 {dateTime.time}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">⏱️ {call.duration} minutes</span>
                          </div>
                          {call.condition && (
                            <div className="flex items-center">
                              <span className="font-medium">🏥 {call.condition}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium">💰 Fee: ${call.consultationFee}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className={`text-sm font-medium ${
                            canJoin ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {canJoin ? '🟢 Available Now!' : `⏰ In ${timeUntil}`}
                          </span>
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        {canJoin ? (
                          <button
                            onClick={() => handleJoinCall(call)}
                            className="btn-medigreen font-medium px-6 py-3 flex items-center space-x-2"
                          >
                            <span>🎥</span>
                            <span>Join Call</span>
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-center">
                            <div className="text-sm font-medium">Starts in</div>
                            <div className="text-lg font-bold">{timeUntil}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        {calls.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Video Call Instructions
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• You can join the call up to 15 minutes before the scheduled time</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• Test your camera and microphone before joining</li>
              <li>• Find a quiet, private space for your consultation</li>
              <li>• Have your medical information and questions ready</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientUpcomingCalls;
