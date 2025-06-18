import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';
import VideoCall from '../../components/VideoCall';
import TopBar from '../../components/TopBar';

interface UpcomingCall {
  _id: string;
  patientName: string;
  scheduledDate: string;
  duration: number;
  status: string;
  dailyRoomUrl: string;
  consultationFee: number;
  condition?: string;
}

const UpcomingCalls: React.FC = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [calls, setCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCall, setActiveCall] = useState<{
    roomUrl: string;
    appointmentId: string;
  } | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUpcomingCalls();
    }
  }, [userId]);

  const fetchUpcomingCalls = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/appointments/doctor/${userId}/upcoming`);

      if (response.ok) {
        const data = await response.json();
        setCalls(data.appointments);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch upcoming calls');
      }
    } catch (err) {
      setError('An error occurred while fetching upcoming calls');
      console.error('Fetch upcoming calls error:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinCall = async (appointmentId: string) => {
    try {
      const response = await authenticatedFetch(`/api/appointments/${appointmentId}/join`);

      if (response.ok) {
        const data = await response.json();
        setActiveCall({
          roomUrl: data.roomUrl,
          appointmentId: appointmentId
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Cannot join call at this time');
      }
    } catch (err) {
      alert('An error occurred while joining the call');
      console.error('Join call error:', err);
    }
  };

  const leaveCall = () => {
    setActiveCall(null);
    fetchUpcomingCalls(); // Refresh calls after leaving
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getTimeUntilCall = (dateString: string) => {
    const callTime = new Date(dateString);
    const now = new Date();
    const timeDiff = callTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (daysDiff > 0) {
      return `in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    } else if (hoursDiff > 0) {
      return `in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
    } else if (minutesDiff > 0) {
      return `in ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
    } else if (minutesDiff > -15) {
      return 'starting now';
    } else {
      return 'call ended';
    }
  };

  const canJoinCall = (dateString: string) => {
    const callTime = new Date(dateString);
    const now = new Date();
    const timeDiff = callTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join 15 minutes before and during the call
    return minutesDiff <= 15 && minutesDiff > -60;
  };

  // If in active call, show video call component
  if (activeCall) {
    return (
      <VideoCall
        roomUrl={activeCall.roomUrl}
        onLeave={leaveCall}
        userType="doctor"
        appointmentId={activeCall.appointmentId}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading upcoming calls...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <TopBar 
  title="Upcoming Calls"
  backUrl="/doctor/dashboard"
  backButtonText="Back to Dashboard"
  showProfileButton={true}
/>


      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Upcoming Video Calls</h2>
          <button
            onClick={fetchUpcomingCalls}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📞</div>
              <p className="text-gray-500 text-lg mb-2">No upcoming video calls scheduled</p>
              <p className="text-gray-400 text-sm">
                Approved appointments will appear here when scheduled
              </p>
            </div>
          ) : (
            calls.map((call) => {
              const { date, time } = formatDateTime(call.scheduledDate);
              const timeUntil = getTimeUntilCall(call.scheduledDate);
              const canJoin = canJoinCall(call.scheduledDate);

              return (
                <div key={call._id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="text-gray-800 font-medium text-lg mb-2">
                        👤 Patient: {call.patientName}
                      </p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 Date: {date}</p>
                        <p>🕐 Time: {time}</p>
                        <p>⏱️ Duration: {call.duration} minutes</p>
                        {call.condition && (
                          <p>🏥 Condition: {call.condition}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                        timeUntil === 'starting now' ? 'bg-green-100 text-green-800' :
                        timeUntil.includes('minute') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        ⏰ {timeUntil}
                      </div>
                      <p className="text-gray-600 text-sm">
                        💰 Fee: ${call.consultationFee}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {canJoin ? (
                        <button
                          onClick={() => joinCall(call._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                        >
                          📞 Join Call
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                        >
                          ⏰ Not Available
                        </button>
                      )}
                      <button
                        onClick={() => console.log('View patient details:', call._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        📋 Patient Info
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Call Instructions */}
        {calls.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Call Instructions</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• You can join calls 15 minutes before the scheduled time</li>
              <li>• Ensure you have a stable internet connection</li>
              <li>• Test your camera and microphone before joining</li>
              <li>• Calls will automatically end after the scheduled duration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingCalls;
