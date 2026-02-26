// /client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService'; // Import the service

import Navbar from './components/Navbar.jsx'; //EDITADO
import Dashboard from './pages/Dashboard.jsx'; //EDITADO
import Login from './pages/Login.jsx'; //EDITADO
import Register from './pages/Register.jsx'; //EDITADO
import SubmitLog from './pages/SubmitLog.jsx'; //EDITADO

function App() {
  // 1. Get the current user from Local Storage
  const currentUser = authService.getCurrentUser(); 
  
  // 2. Determine if someone is actually logged in based on whether the data exists
  const isAuthenticated = !!currentUser;

  return (
    <Router>
      <div className="app-container">
        {/* Pass the real username to the Navbar if the user is logged in */}
        {isAuthenticated && <Navbar username={currentUser.user.username} />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes: Only accessible if isAuthenticated is true */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/log-usage" 
              element={isAuthenticated ? <SubmitLog /> : <Navigate to="/login" />} 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;