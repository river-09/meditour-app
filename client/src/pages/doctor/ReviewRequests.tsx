import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import TopBar from '../../components/TopBar';

interface ReviewRequest {
  _id: string;
  patientName: string;
  patientEmail: string;
  condition: string;
  message?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  submittedOn: string;
  doctorNotes?: string;
}

const ReviewRequests: React.FC = () => {
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const handleViewDetails = async (requestId: string) => {
    try {
      const response = await authenticatedFetch(`/api/review-requests/${requestId}`);
      
      if (response.ok) {
        const requestData = await response.json();
        // You can show a modal or navigate to a details page
        alert(`Patient: ${requestData.patientName}\nCondition: ${requestData.condition}\nMessage: ${requestData.message || 'No message'}`);
      } else {
        alert('Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Error fetching request details');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
  try {
    // First, approve the review request
    const statusResponse = await authenticatedFetch(`/api/review-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        status: 'approved',
        doctorNotes: 'Request approved for video consultation'
      })
    });

    if (!statusResponse.ok) {
      alert('Failed to approve request');
      return;
    }

    // Then, create an appointment from the approved request
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 1); // Schedule 1 hour from now

    const appointmentResponse = await authenticatedFetch('/api/appointments/create-from-request', {
      method: 'POST',
      body: JSON.stringify({
        reviewRequestId: requestId,
        scheduledDate: scheduledDate.toISOString(),
        duration: 30
      })
    });

    if (appointmentResponse.ok) {
      alert('Request approved and appointment scheduled successfully!');
      fetchRequests(); // Refresh the list
    } else {
      const errorData = await appointmentResponse.json();
      alert(`Failed to create appointment: ${errorData.message}`);
    }

  } catch (error) {
    console.error('Error approving request:', error);
    alert('Error approving request');
  }
};


  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await authenticatedFetch(`/api/review-requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'rejected',
          doctorNotes: reason
        })
      });

      if (response.ok) {
        alert('Request rejected successfully');
        fetchRequests(); // Refresh the list
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId, filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authenticatedFetch(`/api/review-requests/doctor/${userId}?status=${filter}`);

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Use the reusable TopBar component */}
      <TopBar 
        title="Review Requests"
        backUrl="/doctor/dashboard"
        backButtonText="Back to Dashboard"
        showProfileButton={true}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Review Requests</h2>
          
          {/* Filter buttons */}
          <div className="flex space-x-2">
            {['pending', 'reviewed', 'all'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-4 py-2 rounded-md capitalize ${
                  filter === filterOption
                    ? 'btn-medigreen'
                    : 'btn-medigreen-light border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">No {filter !== 'all' ? filter : ''} requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-800 mb-2">
                      Patient: {request.patientName}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Email: {request.patientEmail}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Condition: {request.condition}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(request.submittedOn).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    {request.message && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Message:</p>
                        <p className="text-sm text-gray-600">{request.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {request.doctorNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">Doctor Notes:</p>
                    <p className="text-sm text-gray-600">{request.doctorNotes}</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-3">
                  <button className="btn-medigreen"
                  onClick={() => handleViewDetails(request._id)}>
                    View Details
                  </button>
                  
                  {request.status === 'pending' && (
                    <>
                      <button className="btn-medigreen"
                      onClick={() => handleApproveRequest(request._id)}>
                        Approve & Schedule Call
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleRejectRequest(request._id)}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewRequests;
