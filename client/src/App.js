import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import GateTrackerLanding from './Screens/HomeScreen/HomeScreen';
import LoginScreen from './Screens/LoginScreen/LoginScreen';
import RegisterPage from './Screens/RegisterScreen/Register';
import GateDashboard from './Screens/Dashboard/dashboard';
import HabitTracker from './Screens/HabitTracker/HabitTracker';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GateTrackerLanding />} />
        <Route path="/login" element={<LoginScreen />}/>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<GateDashboard />} />
        <Route path="/habits" element={<HabitTracker />} />
        
      </Routes>
    </Router>
  )
}

export default App;
