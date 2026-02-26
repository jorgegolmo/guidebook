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

// 1. Submit a new AI usage log
const submitLog = async (topic, transcript) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ topic, transcript }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit log');
  }

  return data;
};

// 2. Fetch all usage logs for the logged-in student
const getLogs = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getAuthHeader(), // We only need headers here, no body for a GET request
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch logs');
  }

  return data; // Returns an array of log objects from MongoDB
};

const logService = {
  submitLog,
  getLogs,
};

export default logService;