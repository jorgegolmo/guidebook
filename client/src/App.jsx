// /client/src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import authService from './services/authService'; 

import Navbar from './components/Navbar.jsx'; 
import Dashboard from './pages/Dashboard.jsx'; 
import Login from './pages/Login.jsx'; 
import Register from './pages/Register.jsx'; 
import SubmitLog from './pages/SubmitLog.jsx'; 
import GuidelinesPage from './pages/GuidelinesPage.jsx';
import LogsPage from './pages/LogsPage.jsx';

// --- Extracted Gatekeeper Component ---
// This handles the authentication check in ONE place.
const ProtectedLayout = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    // If not logged in, redirect to login page safely
    return <Navigate to="/login" replace />;
  }
  // If logged in, render the child routes
  return <Outlet />;
};

function AppContent() {
  const location = useLocation();
  
  // Get the current user from Local Storage
  const currentUser = authService.getCurrentUser(); 
  
  // Determine if someone is actually logged in based on whether the data exists
  const isAuthenticated = !!currentUser;
  
  // Check if current route is a login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    // when the user is logged in add a class to body so CSS can offset content
    document.body.classList.toggle('authenticated', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div className="app-container">
      {/* Fixed Unsafe Access: Using optional chaining (?.) prevents the app from crashing 
        if the local storage data structure is unexpected. 
      */}
      {isAuthenticated && <Navbar username={currentUser?.user?.username || 'Student'} />}
      
      <main className={`main-content ${isAuthPage ? 'auth-page' : ''}`}>        
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes Grouped Together */}
            <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/log-usage" element={<SubmitLog />} />
              <Route path="/guidelines" element={<GuidelinesPage />} />
              <Route path="/logs" element={<LogsPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
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