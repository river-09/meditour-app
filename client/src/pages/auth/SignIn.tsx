import React, { useEffect } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import logo from '../../assets/logo.jpg';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isSignedIn } = useAuth();
  const role = searchParams.get('role') || 'patient';

  // Store role in sessionStorage for later use
  useEffect(() => {
    if (role === 'doctor' || role === 'patient') {
      sessionStorage.setItem('pendingUserRole', role);
    }
  }, [role]);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      const storedRole = sessionStorage.getItem('pendingUserRole') || role;
      const redirectUrl = storedRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      sessionStorage.removeItem('pendingUserRole'); // Clean up
      navigate(redirectUrl, { replace: true });
    }
  }, [isSignedIn, role, navigate]);

  const getRedirectUrl = () => {
    return role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
  };

  const getTitle = () => {
    return role === 'doctor' ? 'Doctor Sign In' : 'Patient Sign In';
  };

  const getSubtitle = () => {
    return role === 'doctor' ? 'Access your medical practice dashboard' : 'Access your health management portal';
  };

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
          <p className="text-sm text-gray-500">{getSubtitle()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="MedTour" className="h-10 w-10 rounded-full" />
              <span className="text-xl font-bold text-gray-900">MedTour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="mt-2 text-gray-600">{getSubtitle()}</p>
          </div>
          
          <ClerkSignIn 
            afterSignInUrl={getRedirectUrl()}
            redirectUrl={getRedirectUrl()}
            routing="path"
            path="/sign-in"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
