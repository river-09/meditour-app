import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';
import TopBar from '../../components/TopBar';

interface Patient {
  _id: string;
  patientName: string;
  latestAppointment: string;
  totalAppointments: number;
  lastCondition?: string;
  appointmentStatuses: string[];
}

const Patients: React.FC = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchPatients();
    }
  }, [userId, currentPage]);

  const fetchPatients = async () => {
  try {
    setLoading(true);
    setError('');
    
    console.log('Fetching patients for user:', userId);
    
    const response = await authenticatedFetch(
      `/api/appointments/doctor/${userId}/patients?page=${currentPage}&limit=20`
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Patients data received:', data);
      setPatients(data.patients || []);
      setTotalPages(data.totalPages || 1);
    } else {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      setError(errorData.message || 'Failed to fetch patients');
    }
  } catch (err) {
    console.error('Fetch patients error:', err);
    
    // Handle different types of errors
    if (err instanceof Error) {
      if (err.message.includes('HTTP 500')) {
        setError('Server error occurred. Please try again later.');
      } else if (err.message.includes('HTTP 401')) {
        setError('Authentication failed. Please sign in again.');
      } else {
        setError('An error occurred while fetching patients');
      }
    } else {
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPatientStatus = (statuses: string[]) => {
    if (statuses.includes('scheduled')) return 'Active';
    if (statuses.includes('completed')) return 'Treated';
    return 'Inactive';
  };

  const getStatusColor = (statuses: string[]) => {
    if (statuses.includes('scheduled')) return 'bg-green-100 text-green-800';
    if (statuses.includes('completed')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredPatients = patients.filter(patient =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.lastCondition && patient.lastCondition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewProfile = (patientId: string) => {
    // Navigate to patient profile or show modal
    console.log('View profile for patient:', patientId);
    // You can implement navigation to patient details page
    // window.location.href = `/doctor/patient/${patientId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading patients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <TopBar 
  title="Your Patients"
  backUrl="/doctor/dashboard"
  backButtonText="Back to Dashboard"
  showProfileButton={true}
/>



      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Your Patients</h2>
          
          {/* Search and filters */}
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={fetchPatients}
              className="px-4 py-2 btn-medigreen  bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
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

        {/* Patients grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full bg-white shadow rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? 'No patients found matching your search' : 'No patients found'}
              </p>
              <p className="text-gray-400 text-sm">
                Patients will appear here after appointments are scheduled
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    👤 {patient.patientName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.appointmentStatuses)}`}>
                    {getPatientStatus(patient.appointmentStatuses)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {patient.lastCondition && (
                    <p className="text-gray-600">
                      <span className="font-medium">🏥 Condition:</span> {patient.lastCondition}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">📊 Total Appointments:</span> {patient.totalAppointments}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">📅 Last Visit:</span> {formatDate(patient.latestAppointment)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProfile(patient._id)}
                    className="flex-1 btn-medigreen bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    📋 View Profile
                  </button>
                  <button
                    onClick={() => console.log('Schedule appointment for:', patient._id)}
                    className="px-3 py-2 btn-medigreen  bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    📅
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 btn-medigreen  rounded-md disabled:opacity-50 hover:bg-gray-400 transition-colors"
            >
              ← Previous
            </button>
            
            <span className="text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300  btn-medigreen text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Patient Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{patients.length}</p>
              <p className="text-gray-600">Total Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {patients.filter(p => p.appointmentStatuses.includes('scheduled')).length}
              </p>
              <p className="text-gray-600">Active Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
              </p>
              <p className="text-gray-600">Total Appointments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
