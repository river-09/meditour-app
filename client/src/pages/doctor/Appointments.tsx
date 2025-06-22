import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';
import VideoCall from '../../components/VideoCall';
import TopBar from '../../components/TopBar';

interface Appointment {
  _id: string;
  patientName: string;
  scheduledDate: string;
  duration: number;
  status: string;
  dailyRoomUrl: string;
  consultationFee: number;
  condition?: string;
}

const Appointments: React.FC = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCall, setActiveCall] = useState<{
    roomUrl: string;
    appointmentId: string;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const response = await authenticatedFetch(`/api/appointments/doctor/${userId}${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('An error occurred while fetching appointments');
      console.error('Fetch appointments error:', err);
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

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await authenticatedFetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchAppointments(); // Refresh appointments
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update appointment status');
      }
    } catch (err) {
      alert('An error occurred while updating appointment');
      console.error('Update appointment error:', err);
    }
  };

  const leaveCall = () => {
    setActiveCall(null);
    fetchAppointments(); // Refresh appointments
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canJoinCall = (appointment: Appointment) => {
    if (appointment.status !== 'scheduled') return false;
    
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join 15 minutes before and during the call
    return minutesDiff <= 15 && minutesDiff > -appointment.duration;
  };

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
          <div className="text-xl text-gray-600">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <TopBar 
        title="Appointments"
  backUrl="/doctor/dashboard"
  backButtonText="Back to Dashboard"
  showProfileButton={true}
/>


      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Your Appointments</h2>
          
          {/* Filter buttons */}
          <div className="flex space-x-2">
            {['all', 'scheduled', 'completed', 'cancelled'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-4 btn-medigreen py-2 rounded-md capitalize ${
                  filter === filterOption
                    ? 'bg-green-600 text-white btn-medigreen'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 btn-medigreen-light'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
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
          {appointments.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg mb-2">
                No {filter !== 'all' ? filter : ''} appointments found
              </p>
              <p className="text-gray-400 text-sm">
                Scheduled appointments will appear here
              </p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Patient Info */}
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                      {appointment.patientName}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {formatDateTime(appointment.scheduledDate)}</p>
                      <p>⏱️ Duration: {appointment.duration} minutes</p>
                      {appointment.condition && (
                        <p>🏥 Condition: {appointment.condition}</p>
                      )}
                    </div>
                  </div>

                  {/* Status and Fee */}
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <p className="text-gray-600 text-sm mt-2">
                      💰 Fee: ${appointment.consultationFee}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {canJoinCall(appointment) ? (
                      <button
                        onClick={() => joinCall(appointment._id)}
                        className="px-4 btn-medigreen py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                      >
                        📞 Join Video Call
                      </button>
                    ) : appointment.status === 'scheduled' ? (
                      <button
                        disabled
                        className="px-4 btn-medigreen py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                      >
                        ⏰ Call Not Ready
                      </button>
                    ) : null}
                    
                    <button
                      onClick={() => console.log('View details:', appointment._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📋 View Details
                    </button>
                    
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Statistics */}
        {appointments.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
                <p className="text-gray-600">Scheduled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter(a => a.status === 'cancelled').length}
                </p>
                <p className="text-gray-600">Cancelled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${appointments.reduce((sum, a) => sum + (a.status === 'completed' ? a.consultationFee : 0), 0)}
                </p>
                <p className="text-gray-600">Total Earned</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;