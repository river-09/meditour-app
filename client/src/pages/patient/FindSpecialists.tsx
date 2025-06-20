import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
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
}

const FindSpecialists: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('experience');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minExperience: '',
    maxFee: '',
    location: ''
  });

  // Available specializations
  const specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'General Medicine', 'Surgery',
    'Gynecology', 'Ophthalmology', 'ENT', 'Radiology'
  ];

  const specializationIcons: { [key: string]: string } = {
    'Cardiology': '❤️',
    'Dermatology': '🧴',
    'Neurology': '🧠',
    'Orthopedics': '🦴',
    'Pediatrics': '👶',
    'Psychiatry': '🧘',
    'General Medicine': '🩺',
    'Surgery': '⚕️',
    'Gynecology': '👩‍⚕️',
    'Ophthalmology': '👁️',
    'ENT': '👂',
    'Radiology': '🔬'
  };

  const fetchDoctors = async (specialization: string) => {
    setLoading(true);
    try {
      let url = `/api/doctor/all?specialization=${encodeURIComponent(specialization)}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await authenticatedFetch(url);
      
      if (response.ok) {
        const data = await response.json();
        let filteredDoctors = data.doctors || [];

        // Apply client-side filters
        if (filters.minExperience) {
          filteredDoctors = filteredDoctors.filter((doc: Doctor) => 
            doc.experience >= parseInt(filters.minExperience)
          );
        }
        if (filters.maxFee) {
          filteredDoctors = filteredDoctors.filter((doc: Doctor) => 
            doc.consultationFee <= parseInt(filters.maxFee)
          );
        }
        if (filters.location) {
          filteredDoctors = filteredDoctors.filter((doc: Doctor) => 
            doc.clinicAddress.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        // Apply sorting
        filteredDoctors.sort((a: Doctor, b: Doctor) => {
          switch (sortBy) {
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'experience':
              return b.experience - a.experience;
            case 'fee':
              return a.consultationFee - b.consultationFee;
            default:
              return 0;
          }
        });

        setDoctors(filteredDoctors);
      } else {
        console.error('Failed to fetch doctors:', response.statusText);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctors(selectedSpecialization);
    }
  }, [selectedSpecialization, searchTerm, sortBy, filters]);

  const handleSpecializationSelect = (specialization: string) => {
    setSelectedSpecialization(specialization);
    setSearchTerm('');
  };

  const renderStars = (rating: number) => {
    const stars = Math.floor(rating || 0);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="btn-medigreen font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Specialists</h1>
          <p className="text-gray-600">
            Connect with qualified doctors and specialists for your healthcare needs.
          </p>
        </div>

        {!selectedSpecialization ? (
          /* Specialization Selection */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose a Specialization</h2>
            
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#1f2937', backgroundColor: 'white' }}
              />
            </div>

            {/* Specializations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {specializations
                .filter(spec => 
                  spec.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((specialization) => (
                <div
                  key={specialization}
                  onClick={() => handleSpecializationSelect(specialization)}
                  className="p-6 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">
                      {specializationIcons[specialization] || '🩺'}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {specialization}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Find {specialization.toLowerCase()} specialists
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Doctor Listings */
          <div>
            {/* Header with Back to Specializations */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedSpecialization('')}
                  className="btn-medigreen font-medium"
                >
                  ← Back to Specializations
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{specializationIcons[selectedSpecialization]}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSpecialization} Specialists</h2>
                </div>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-medigreen font-medium"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Doctors
                    </label>
                    <input
                      type="text"
                      placeholder="Doctor name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Experience (years)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 5"
                      value={filters.minExperience}
                      onChange={(e) => setFilters({...filters, minExperience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Consultation Fee
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      value={filters.maxFee}
                      onChange={(e) => setFilters({...filters, maxFee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'rating' | 'experience' | 'fee')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                    >
                      <option value="experience">Most Experienced</option>
                      <option value="rating">Highest Rated</option>
                      <option value="fee">Lowest Fee</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `Found ${doctors.length} ${selectedSpecialization.toLowerCase()} specialists`}
              </p>
            </div>

            {/* Doctor Cards */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">Loading doctors...</div>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">👨‍⚕️</div>
                <p className="text-gray-500 mb-2">No doctors found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          Dr. {doctor.fullName}
                        </h3>
                        <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                        <p className="text-gray-700 text-sm mb-2 font-medium">{doctor.qualification}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-yellow-400 text-lg">{renderStars(doctor.rating || 4)}</span>
                          <span className="text-gray-700 text-sm font-medium">
                            {(doctor.rating || 4).toFixed(1)} ({doctor.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          ${doctor.consultationFee}
                        </div>
                        <div className="text-sm text-gray-500">consultation</div>
                      </div>
                    </div>

                    {/* Experience & Location */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500 block">Experience</span>
                        <p className="font-medium text-gray-900">{doctor.experience} years</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Location</span>
                        <p className="font-medium text-gray-900 text-sm">{doctor.clinicAddress}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/patient/request-review/${doctor._id}`)}
                        className="w-full btn-medigreen font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindSpecialists;
