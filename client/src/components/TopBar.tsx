import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import logo from '../assets/logo.jpg';

interface DoctorProfile {
  fullName: string;
  specialization: string;
  isProfileComplete: boolean;
}

interface TopBarProps {
  title: string;
  backUrl?: string;
  backButtonText?: string;
  showProfileButton?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  backUrl = '/doctor/dashboard', 
  backButtonText = 'Back to Dashboard',
  showProfileButton = true 
}) => {
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);

  useEffect(() => {
    if (userId && isLoaded) {
      fetchDoctorProfile();
    }
  }, [userId, isLoaded]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await authenticatedFetch('/api/doctor/profile');
      
      if (response.ok) {
        const profileData = await response.json();
        setDoctorProfile({
          fullName: profileData.fullName || '',
          specialization: profileData.specialization || '',
          isProfileComplete: profileData.isProfileComplete || false
        });
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      // Don't set error for profile fetch, just use fallback name
    }
  };

  // Enhanced function to get display name from doctor profile
  const getDisplayName = () => {
    if (!isLoaded) return 'Loading...';
    
    // First try to get name from doctor profile
    if (doctorProfile?.fullName && doctorProfile.fullName.trim() !== '') {
      return doctorProfile.fullName;
    }
    
    // Fallback to Clerk user data
    if (user?.fullName && user.fullName.trim() !== '') {
      return user.fullName;
    }
    
    // Combine first and last name from Clerk
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const combinedName = `${firstName} ${lastName}`.trim();
    
    if (combinedName !== '') {
      return combinedName;
    }
    
    // Extract name from email as last resort
    if (user?.primaryEmailAddress?.emailAddress) {
      const emailName = user.primaryEmailAddress.emailAddress.split('@')[0];
      const formattedName = emailName
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return formattedName;
    }
    
    return 'Doctor';
  };

  const handleNavigation = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
        <h1 className="text-2xl font-bold text-gray-800">MedTour</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => handleNavigation(backUrl)}
          className="btn-medigreen"
        >
          {backButtonText}
        </button>
        
        <div className="text-right">
          <p className="text-gray-600 text-lg">Welcome, Dr. {getDisplayName()}</p>
          <div className="flex flex-col text-right">
            {doctorProfile?.specialization && (
              <p className="text-gray-500 text-sm">{doctorProfile.specialization}</p>
            )}
            
          </div>
        </div>

        {showProfileButton && (
          <button
            onClick={() => handleNavigation('/doctor/setup-profile')}
            className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            👤
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
