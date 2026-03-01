// /client/src/services/logService.js

const API_URL = 'http://localhost:5000/api/logs/';

// Helper function to get the authorization header securely
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.token) {
    return { 
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  } else {
    return {}; // If no token exists, return an empty object (the request will likely fail, which is expected)
  }
};

// Create a new session (specify AI model and optional title)
const createSession = async (aiModel, title = '') => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ aiModel, title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create session');
  return data;
};

// Add an entry to an existing session
const addEntry = async (sessionId, prompt, response = null) => {
  const res = await fetch(`${API_URL}${sessionId}/entries`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ prompt, response }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add entry');
  return data;
};

// Fetch all sessions for the user
const getSessions = async () => {
  const res = await fetch(API_URL, { method: 'GET', headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch sessions');
  return data;
};

// Fetch a single session by id
const getSession = async (sessionId) => {
  const res = await fetch(`${API_URL}${sessionId}`, { method: 'GET', headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch session');
  return data;
};

const logService = { createSession, addEntry, getSessions, getSession };

export default logService;