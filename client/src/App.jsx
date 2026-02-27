// /client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import authService from './services/authService'; // Import the service

import Navbar from './components/Navbar.jsx'; //EDITADO
import Dashboard from './pages/Dashboard.jsx'; //EDITADO
import Login from './pages/Login.jsx'; //EDITADO
import Register from './pages/Register.jsx'; //EDITADO
import SubmitLog from './pages/SubmitLog.jsx'; //EDITADO
import GuidelinesPage from './pages/GuidelinesPage.jsx';

function AppContent() {
  const location = useLocation();
  
  // Get the current user from Local Storage
  const currentUser = authService.getCurrentUser(); 
  
  // Determine if someone is actually logged in based on whether the data exists
  const isAuthenticated = !!currentUser;
  
  // Check if current route is a login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {/* Pass the real username to the Navbar if the user is logged in */}
      {isAuthenticated && <Navbar username={currentUser.user.username} />}
      
      <main className={`main-content ${isAuthPage ? 'auth-page' : ''}`} style={isAuthenticated ? { paddingTop: '70px' } : {}}>
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

            <Route 
              path="/guidelines" 
              element={isAuthenticated ? <GuidelinesPage /> : <Navigate to="/login" />} 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;