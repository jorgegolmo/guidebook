// /client/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // Import the service

const Navbar = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Actually clear the JWT token and user data from Local Storage
    authService.logout();
    
    // 2. Redirect back to the login page with a full page reload
    window.location.href = '/login';
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.link}>
          <h1 style={styles.title}>AI Guidebook for Student</h1>
        </Link>
      </div>
      
      <div style={styles.userSection}>
        <Link to="/guidelines" style={{ ...styles.link, marginRight: '20px', fontSize: '0.9rem' }}>
          Guidelines
        </Link>
        <Link to="/logs" style={{ ...styles.link, marginRight: '20px', fontSize: '0.9rem' }}>
          Logs
        </Link>
        <span style={styles.greeting}>Hello, {username}</span>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </div>
    </nav>
  );
};

// Inline styles (same as before)
const styles = {
  navbar: {
    position: 'sticky',      // occupy space and stick at top when scrolling
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 'var(--navbar-height)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1001          // make sure it's above overlays
  },
  brand: { margin: 0, fontSize: '1.5rem' },
  title: { margin: 0, fontSize: '1.5rem' },
  link: { color: '#fff', textDecoration: 'none' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  greeting: { fontSize: '16px' },
  logoutButton: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default Navbar;