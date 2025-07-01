import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import GateTrackerLanding from './Screens/HomeScreen/HomeScreen';
import LoginScreen from './Screens/LoginScreen/LoginScreen';
import RegisterPage from './Screens/RegisterScreen/Register';
import GateDashboard from './Screens/Dashboard/dashboard';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GateDashboard />} />
        <Route path="/login" element={<LoginScreen />}/>
        <Route path="/register" element={<RegisterPage />} />
        
      </Routes>
    </Router>
  )
}

export default App;
