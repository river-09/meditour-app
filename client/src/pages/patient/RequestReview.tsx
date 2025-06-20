import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  clinicAddress: string;
  bio: string;
  languages: string[];
  rating?: number;
  totalReviews?: number;
  availability: string;
  phoneNumber?: string;
  email?: string;
}

const RequestReview: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching doctor with ID:', doctorId);
        
        // Use the patient route that you have in patientRoutes.js
        const response = await authenticatedFetch(`/api/patient/doctor/${doctorId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          
          if (data.success && data.doctor) {
            setDoctor(data.doctor);
          } else {
            console.error('Doctor not found in response');
            setDoctor(null);
          }
        } else {
          console.error('Failed to fetch doctor:', response.statusText);
          setDoctor(null);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId, authenticatedFetch]);

  const handleRequestReview = async () => {
    try {
      // This will be implemented when you create the review request functionality
      setRequestSent(true);
      alert('Review request sent successfully! The doctor will be able to view your medical information.');
    } catch (error) {
      console.error('Error sending review request:', error);
      alert('Failed to send review request. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    const stars = Math.floor(rating || 0);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading doctor details...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img src={logo} alt="MedTour" className="h-10 w-10 rounded-full" />
                <span className="text-xl font-bold text-gray-900">MedTour</span>
              </div>
              <UserButton afterSignOutUrl="/auth/signin" />
            </div>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
            <p className="text-gray-600 mb-4">Doctor ID: {doctorId}</p>
            <button
              onClick={() => navigate('/patient/find-doctors')}
              className="btn-medigreen font-medium"
            >
              ← Back to Find Specialists
            </button>
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
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Patient
              </span>
            </div>
            <UserButton afterSignOutUrl="/auth/signin" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/patient/find-doctors')}
            className="btn-medigreen font-medium"
          >
            ← Back to Find Specialists
          </button>
        </div>

        {/* Request Review Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dr. {doctor.fullName}</h1>
                <p className="text-blue-100 text-lg font-medium">{doctor.specialization}</p>
                <p className="text-blue-100">{doctor.qualification}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">${doctor.consultationFee}</div>
                <div className="text-blue-100 text-sm">per consultation</div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Rating and Reviews */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 text-2xl">{renderStars(doctor.rating || 4)}</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {(doctor.rating || 4).toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600">
                  Based on {doctor.totalReviews || 0} patient reviews
                </span>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{doctor.experience}</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{doctor.totalReviews || 0}</div>
                <div className="text-gray-600 text-sm">Patient Reviews</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {doctor.rating ? (doctor.rating * 20).toFixed(0) : 80}%
                </div>
                <div className="text-gray-600 text-sm">Satisfaction Rate</div>
              </div>
            </div>

            {/* About Section */}
            {doctor.bio && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About Dr. {doctor.fullName}</h3>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Location */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📍 Clinic Location</h4>
                <p className="text-gray-700">{doctor.clinicAddress}</p>
              </div>

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">🗣️ Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {doctor.availability && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">⏰ Availability</h4>
                  <p className="text-gray-700">{doctor.availability}</p>
                </div>
              )}

              {/* Specialization */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">🩺 Specialization</h4>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  {doctor.specialization}
                </span>
              </div>
            </div>

            {/* Request Review Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to consult with Dr. {doctor.fullName}?
                </h3>
                <p className="text-gray-600 mb-6">
                  Send a review request to share your medical information and get personalized care.
                </p>
                
                {!requestSent ? (
                  <button
                    onClick={handleRequestReview}
                    className="btn-medigreen font-medium px-8 py-3 text-lg"
                  >
                    Request Review
                  </button>
                ) : (
                  <div className="inline-flex items-center px-8 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Review Request Sent
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-3">
                  The doctor will be notified and can access your medical profile for better consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReview;
