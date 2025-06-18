import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import logo from '../../assets/logo.jpg';

interface DoctorProfile {
  fullName: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  clinicAddress: string;
  phoneNumber: string;
  email: string;
  bio: string;
  languages: string[];
  availability: string;
}

const SetUpProfile: React.FC = () => {
  const { user } = useUser();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [profile, setProfile] = useState<DoctorProfile>({
    fullName: user?.fullName || '',
    specialization: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    clinicAddress: '',
    phoneNumber: '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    bio: '',
    languages: [],
    availability: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Psychiatry', 'General Medicine', 'Surgery',
    'Gynecology', 'Ophthalmology', 'ENT', 'Radiology'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    setProfile(prev => ({
      ...prev,
      languages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    console.log('Submitting profile data:', profile);
    
    const response = await authenticatedFetch('/api/doctor/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });

    // If we reach here, the response was successful (200-299)
    const data = await response.json();
    console.log('Profile update successful:', data);
    
    setMessage('Profile updated successfully!');
    setTimeout(() => {
      window.location.href = '/doctor/dashboard';
    }, 2000);
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('HTTP 401')) {
        setMessage('Authentication failed. Please sign in again.');
      } else if (error.message.includes('HTTP 400')) {
        setMessage('Invalid profile data. Please check all required fields.');
      } else if (error.message.includes('HTTP 500')) {
        setMessage('Server error. Please try again later.');
      } else {
        setMessage(error.message || 'Failed to update profile. Please try again.');
      }
    } else {
      setMessage('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
        </div>
        <button 
          onClick={() => window.location.href = '/doctor/dashboard'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Setup Your Profile</h2>
          
          {message && (
            <div className={`mb-4 p-4 rounded-md border ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           placeholder-gray-500"
                />
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="" className="text-gray-500">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec} className="text-gray-900 bg-white">
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g., MBBS, MD, PhD"
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           placeholder-gray-500"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={profile.experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  placeholder="Enter years of experience"
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           placeholder-gray-500"
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee (USD) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={profile.consultationFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter consultation fee"
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           placeholder-gray-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           hover:border-gray-400 transition-colors duration-200
                           placeholder-gray-500"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                         hover:border-gray-400 transition-colors duration-200
                         placeholder-gray-500"
              />
            </div>

            {/* Clinic Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clinic Address *
              </label>
              <textarea
                name="clinicAddress"
                value={profile.clinicAddress}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter your clinic's complete address"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                         hover:border-gray-400 transition-colors duration-200
                         placeholder-gray-500 resize-vertical"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages Spoken (comma-separated)
              </label>
              <input
                type="text"
                name="languages"
                value={profile.languages.join(', ')}
                onChange={handleLanguageChange}
                placeholder="e.g., English, Spanish, French, Hindi"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                         hover:border-gray-400 transition-colors duration-200
                         placeholder-gray-500"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Availability
              </label>
              <input
                type="text"
                name="availability"
                value={profile.availability}
                onChange={handleInputChange}
                placeholder="e.g., Mon-Fri 9AM-5PM, Weekends 10AM-2PM"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                         hover:border-gray-400 transition-colors duration-200
                         placeholder-gray-500"
              />
            </div>

            {/* Professional Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Brief description of your expertise, approach to patient care, and professional background"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                         hover:border-gray-400 transition-colors duration-200
                         placeholder-gray-500 resize-vertical"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-md 
                         hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 transform hover:scale-105
                         shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Profile...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetUpProfile;
