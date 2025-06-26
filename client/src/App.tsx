// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

import Home from './pages/common/Home';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// Doctor Components
import DoctorDashboard from './pages/doctor/Dashboard';
import ReviewRequests from './pages/doctor/ReviewRequests';
import Appointments from './pages/doctor/Appointments';
import UpcomingCalls from './pages/doctor/UpcomingCalls';
import Patients from './pages/doctor/Patients';
import SetUpProfiled from './pages/doctor/SetUpProfiled';

// Patient Components
import PatientDashboard from './pages/patient/Dashboard';
import SetUpProfile from './pages/patient/SetUpProfile';
import FindSpecialists from './pages/patient/FindSpecialists';
import RequestReview from './pages/patient/RequestReview';
import PatientAppointments from './pages/patient/Appointments';
import PatientUpcomingCalls from './pages/patient/UpcomingCalls';

import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/auth/signin" 
          element={isSignedIn ? <Navigate to="/" replace /> : <SignIn />} 
        />
        <Route 
          path="/sign-in" 
          element={isSignedIn ? <Navigate to="/" replace /> : <SignIn />} 
        />
        <Route 
          path="/auth/signup" 
          element={isSignedIn ? <Navigate to="/" replace /> : <SignUp />} 
        />
        <Route 
          path="/sign-up" 
          element={isSignedIn ? <Navigate to="/" replace /> : <SignUp />} 
        />

        {/* Doctor Routes - Protected */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/review-requests" element={<ProtectedRoute><ReviewRequests /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/doctor/upcoming-calls" element={<ProtectedRoute><UpcomingCalls /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
        <Route path="/doctor/setup-profile" element={<ProtectedRoute><SetUpProfiled /></ProtectedRoute>} />

        {/* Patient Routes - Protected */}
        <Route path="/patient/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/setup-profile" element={<ProtectedRoute><SetUpProfile /></ProtectedRoute>} />
        <Route path="/patient/find-doctors" element={<ProtectedRoute><FindSpecialists /></ProtectedRoute>} />
        <Route path="/patient/request-review/:doctorId" element={<ProtectedRoute><RequestReview /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
        <Route path="/patient/upcoming-calls" element={<ProtectedRoute><PatientUpcomingCalls /></ProtectedRoute>} />


        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
