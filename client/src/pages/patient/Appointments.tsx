import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import VideoCall from '../../components/VideoCall';
import logo from '../../assets/logo.jpg';

interface Appointment {
  _id: string;
  doctorName: string;
  patientName: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress' | 'no-show';
  condition?: string;
  consultationFee: number;
  meetingNotes?: string;
  dailyRoomUrl?: string;
}

const PatientAppointments: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { authenticatedFetch, userId } = useAuthenticatedFetch();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/patient/appointments/${userId}?status=${filter}`);
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canJoinCall = (appointment: Appointment) => {
    if (appointment.status !== 'scheduled') return false;
    
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join 15 minutes before and during the appointment
    return minutesDiff <= 15 && minutesDiff >= -appointment.duration;
  };

  const handleJoinCall = async (appointment: Appointment) => {
    try {
      console.log('🔍 Attempting to join call:', appointment._id);
      
      // Store patient name for video call
      if (user) {
        const patientName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                           user.emailAddresses[0]?.emailAddress || 'Patient';
        localStorage.setItem('patientName', patientName);
      }

      // Fetch room URL from server
      const response = await authenticatedFetch(`/api/appointments/${appointment._id}/join`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Room URL received:', data.roomUrl);
        setActiveCall({ ...appointment, dailyRoomUrl: data.roomUrl });
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
    console.log('🔄 Leaving call, returning to appointments');
    setActiveCall(null);
    localStorage.removeItem('patientName');
    // Refresh the appointments list
    fetchAppointments();
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

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
            <p className="mt-4 text-gray-600">Loading appointments...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Your Appointments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your scheduled medical consultations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: 'All', color: 'text-gray-600' },
                { key: 'scheduled', label: 'Scheduled', color: 'text-blue-600' },
                { key: 'completed', label: 'Completed', color: 'text-green-600' },
                { key: 'cancelled', label: 'Cancelled', color: 'text-red-600' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    filter === tab.key ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {tab.key === 'all' 
                      ? appointments.length 
                      : appointments.filter(a => a.status === tab.key).length
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter !== 'all' ? filter : ''} appointments found
              </h3>
              <p className="text-gray-600 mb-6">
                Scheduled appointments will appear here
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
              {filteredAppointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.scheduledDate);
                const canJoin = canJoinCall(appointment);
                
                return (
                  <div key={appointment._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dr. {appointment.doctorName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">📅 {dateTime.date}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">🕐 {dateTime.time}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">⏱️ Duration: {appointment.duration} minutes</span>
                          </div>
                          {appointment.condition && (
                            <div className="flex items-center">
                              <span className="font-medium">🏥 Condition: {appointment.condition}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium">💰 Fee: ${appointment.consultationFee}</span>
                          </div>
                        </div>

                        {appointment.meetingNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Doctor's Notes:</strong> {appointment.meetingNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        {canJoin && (
                          <button
                            onClick={() => handleJoinCall(appointment)}
                            className="btn-medigreen font-medium px-4 py-2"
                          >
                            Join Call
                          </button>
                        )}
                        
                        {appointment.status === 'scheduled' && !canJoin && (
                          <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center text-sm">
                            Available 15 min before
                          </span>
                        )}

                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                          📄 View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Appointment Summary */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {appointments.filter(a => a.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Scheduled</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-red-600">
                {appointments.filter(a => a.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Cancelled</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600">
                ${appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.consultationFee, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;
