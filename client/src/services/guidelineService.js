// /client/src/services/guidelineService.js

const API_URL = 'http://localhost:5000/api/guidelines/';

// We don't require authentication for guidelines; they are public by default.
// A simple GET helper that mirrors the style of logService.

const getGuidelines = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch guidelines');
  }

  return data;
};

const guidelineService = {
  getGuidelines
};

export default guidelineService;
