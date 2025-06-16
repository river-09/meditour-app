import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'patient';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Determine role from current path to redirect to appropriate sign-in
    const currentRole = location.pathname.includes('/doctor/') ? 'doctor' : 'patient';
    return <Navigate to={`/sign-in?role=${currentRole}`} replace />;
  }

  // If a specific role is required, check user's role
  if (requiredRole && user) {
    const userRole = getUserRole(user, location.pathname);
    
    if (userRole !== requiredRole) {
      // Redirect to appropriate Dashboard based on actual user role
      const redirectPath = userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to determine user role
const getUserRole = (user: any, currentPath: string): 'doctor' | 'patient' => {
  // Option 1: Check sessionStorage for pending role (from sign-up flow)
  const pendingRole = sessionStorage.getItem('pendingUserRole');
  if (pendingRole === 'doctor' || pendingRole === 'patient') {
    return pendingRole;
  }
  
  // Option 2: Check public metadata (if previously set)
  if (user.publicMetadata?.role) {
    return user.publicMetadata.role as 'doctor' | 'patient';
  }
  
  // Option 3: Check current URL path (most reliable for new signups)
  if (currentPath.includes('/doctor/')) {
    return 'doctor';
  }
  if (currentPath.includes('/patient/')) {
    return 'patient';
  }
  
  // Option 4: Check email patterns
  const email = user.emailAddresses?.[0]?.emailAddress || '';
  
  // Check for doctor-like email patterns
  const doctorPatterns = [
    'doctor',
    'dr.',
    '@clinic',
    '@hospital',
    '@medical'
  ];
  
  const isDoctorEmail = doctorPatterns.some(pattern => 
    email.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isDoctorEmail) {
    return 'doctor';
  }
  
  // Option 5: Check first/last name for doctor titles
  const firstName = user.firstName?.toLowerCase() || '';
  const lastName = user.lastName?.toLowerCase() || '';
  
  if (firstName.includes('dr') || lastName.includes('dr')) {
    return 'doctor';
  }
  
  // Option 6: Default to patient
  return 'patient';
};

export default ProtectedRoute;