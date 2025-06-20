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
import RequestReview from './pages/patient/RequestReview'; // Updated import

import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Doctor Routes - Protected */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/review-requests" element={<ProtectedRoute requiredRole="doctor"><ReviewRequests /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute requiredRole="doctor"><Appointments /></ProtectedRoute>} />
        <Route path="/doctor/upcoming-calls" element={<ProtectedRoute requiredRole="doctor"><UpcomingCalls /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><Patients /></ProtectedRoute>} />
        <Route path="/doctor/setup-profile" element={<ProtectedRoute requiredRole="doctor"><SetUpProfiled /></ProtectedRoute>} />

        {/* Patient Routes - Protected */}
        <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/setup-profile" element={<ProtectedRoute requiredRole="patient"><SetUpProfile /></ProtectedRoute>} />
        <Route path="/patient/find-doctors" element={<ProtectedRoute requiredRole="patient"><FindSpecialists /></ProtectedRoute>} />
        
        {/* Updated route name */}
        <Route path="/patient/request-review/:doctorId" element={<ProtectedRoute requiredRole="patient"><RequestReview /></ProtectedRoute>} />

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to={isSignedIn ? "/patient/dashboard" : "/auth/signin"} replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
