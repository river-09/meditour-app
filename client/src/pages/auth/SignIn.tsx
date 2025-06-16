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
    return role === 'doctor' 
      ? 'Access your medical practice dashboard' 
      : 'Access your health management portal';
  };

  if (isSignedIn) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Logo and Title */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img
            src={logo}
            alt="MedTour Logo"
            className="w-12 h-12 rounded-full object-cover"
          />
          <h1 className="text-3xl font-bold text-gray-800">MedTour</h1>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{getTitle()}</h2>
          <p className="text-gray-600 text-sm">{getSubtitle()}</p>
        </div>
      </div>

      {/* Clerk Sign In Component */}
      <div className="w-full max-w-md">
        <ClerkSignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-lg rounded-2xl border-0",
              headerTitle: "text-2xl font-bold text-gray-800",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700",
              formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white rounded-lg",
              footerActionLink: "text-green-600 hover:text-green-700",
              identityPreviewEditButton: "text-green-600 hover:text-green-700",
              formFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500"
            }
          }}
          redirectUrl={getRedirectUrl()}
          signUpUrl={`/sign-up?role=${role}`}
          afterSignInUrl={getRedirectUrl()}
        />
      </div>
    </div>
  );
};

export default SignIn;