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

// Patient Components
import PatientDashboard from './pages/patient/Dashboard';
import SetUpProfile from './pages/patient/SetUpProfile';

import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Doctor Routes - Protected */}
        <Route path="/doctor/Dashboard" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/Dashboard" element={<Navigate to="/doctor/Dashboard" replace />} />
        <Route path="/doctor/review-requests" element={
          <ProtectedRoute requiredRole="doctor">
            <ReviewRequests />
          </ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute requiredRole="doctor">
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/upcoming-calls" element={
          <ProtectedRoute requiredRole="doctor">
            <UpcomingCalls />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute requiredRole="doctor">
            <Patients />
          </ProtectedRoute>
        } />
        
        {/* Patient Routes - Protected */}
        <Route path="/patient/Dashboard" element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/setup-profile" element={
          <ProtectedRoute requiredRole="patient">
            <SetUpProfile />
          </ProtectedRoute>
        } />
        <Route path="/patient/Dashboard" element={<Navigate to="/patient/Dashboard" replace />} />
        
        {/* Legacy redirects */}
        <Route path="/Dashboard" element={<Navigate to="/" replace />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;