// /client/src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous errors

    if (!username || !password) {
      setErrorMessage('Please enter both a username and a password.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Call our registration service
      await authService.register(username, password);
      
      // If successful, the backend returns a token and authService saves it. 
      // Redirect the user to the dashboard.
      window.location.href = '/dashboard';
      
    } catch (error) {
      setErrorMessage(error.message || 'Failed to register account. Try a different username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create a Student Account</h2>
      <p>Sign up to start logging your AI usage.</p>
      
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., student123"
            style={styles.input}
            disabled={isLoading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a secure password"
            style={styles.input}
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          style={isLoading ? styles.buttonDisabled : styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={styles.footerText}>
        Already have an account? <Link to="/login" style={styles.link}>Log in here</Link>
      </p>
    </div>
  );
};

// Reusing the same clean styles from Login
const styles = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    maxWidth: '400px',
    width: '90%',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    zIndex: 100
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left' },
  input: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { padding: '10px', fontSize: '16px', backgroundColor: '#8cdb9e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' },
  error: { color: 'red', fontSize: '14px', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc' },
  footerText: { marginTop: '20px', fontSize: '14px' },
  link: { color: '#0056b3', textDecoration: 'none', fontWeight: 'bold' }
};

export default Register;