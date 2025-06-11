// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/doctor/common/Home';
import DoctorDashboard from './pages/doctor/Dashboard';
import ReviewRequests from './pages/doctor/ReviewRequests';
import Appointments from './pages/doctor/Appointments';
import UpcomingCalls from './pages/doctor/UpcomingCalls';
import Patients from './pages/doctor/Patients';




const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor" element={< DoctorDashboard />} />
        <Route path="/doctor/review-requests" element={<ReviewRequests />} />
        <Route path="/doctor/appointments" element={<Appointments />} />
        <Route path="/doctor/upcoming-calls" element={<UpcomingCalls />} />
        <Route path="/doctor/patients" element={<Patients />} />
      </Routes>
    </Router>
  );
};

export default App;
