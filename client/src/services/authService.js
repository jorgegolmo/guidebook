// /client/src/services/authService.js

// The base URL for our backend API
const API_URL = 'http://localhost:5000/api/auth/';

// Register a new user
const register = async (username, password) => {
  const response = await fetch(API_URL + 'register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // If successful, save the token and user info to Local Storage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Login an existing user
const login = async (username, password) => {
  const response = await fetch(API_URL + 'login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  // If the server returns a 400 or 401 error, throw it so the UI can catch it
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Save the user data (including the JWT) to the browser's local storage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Logout the user
const logout = () => {
  // Clear the JWT and user data from local storage
  localStorage.removeItem('user');
};

// Get the currently logged-in user data
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Export the functions as a neat package
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;