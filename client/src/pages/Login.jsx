// /client/src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage(''); // Clear any previous errors

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Call our real authentication service
      await authService.login(username, password);
      
      // 2. If successful, the token is now in localStorage. 
      // Redirect the user to the dashboard.
      window.location.href = '/dashboard';

    } catch (error) {
      // 3. If it fails, display the exact error message from the backend
      setErrorMessage(error.message || 'Failed to log in. Please try again.');
    } finally {
      // 4. Turn off the loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <h2>AI Guidebook for Students</h2>
      <p>Please log in to track your AI usage and access resources.</p>
      
      {/* Conditionally render the error message if one exists */}
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={styles.input}
            disabled={isLoading} // Disable input while loading
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          style={isLoading ? styles.buttonDisabled : styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Don't have an account? <Link to="/register" style={{ color: '#0056b3', fontWeight: 'bold' }}>Sign up here</Link>
      </p>
    </div>
  );
};

// Inline styles (same as before, plus a disabled button style)
const styles = {
  container: {
    maxWidth: '400px',
    margin: 'auto',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDisabled: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#82a5c9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed'
  },
  error: {
    color: 'red',
    fontSize: '14px',
    backgroundColor: '#ffe6e6',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ffcccc'
  }
};

export default Login;