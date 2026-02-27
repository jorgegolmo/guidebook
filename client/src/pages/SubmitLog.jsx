// /client/src/pages/SubmitLog.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logService from '../services/logService'; // 1. Import the real API service

const SubmitLog = () => {
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // 2. Add error state
  
  const navigate = useNavigate();

  // 3. Make the submit handler async
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear old errors

    if (!topic || !transcript) {
      setErrorMessage('Please fill out both the topic and paste your transcript.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 4. Call the real backend API
      await logService.submitLog(topic, transcript);

      // 5. If successful, redirect to the dashboard
      navigate('/dashboard');

    } catch (error) {
      // 6. If the server throws an error (e.g., token expired), catch it here
      console.error('Submission error:', error);
      setErrorMessage(error.message || 'Failed to save log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Log AI Usage</h2>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          &larr; Back to Dashboard
        </button>
      </div>

      <div style={styles.card}>
        <p style={styles.instructions}>
          Transparency is key to responsible AI use. Paste the exact conversation 
          (both your prompts and the AI's answers) below for your records.
        </p>

        {/* Display the error message if something goes wrong */}
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="topic" style={styles.label}>Brief Topic or Summary</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Debugging React Code, Brainstorming Essay Ideas"
              style={styles.input}
              disabled={isSubmitting} // Lock input while saving
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="transcript" style={styles.label}>Paste Chat Transcript</label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the full AI conversation here..."
              style={styles.textarea}
              disabled={isSubmitting} // Lock input while saving
            />
          </div>

          <button 
            type="submit" 
            style={isSubmitting ? styles.buttonDisabled : styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving to Database...' : 'Save AI Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline styles 
const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backButton: { background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: '16px', textDecoration: 'underline' },
  // ensure the header stays visible below fixed navbar
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #ccc', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  instructions: { color: '#555', marginBottom: '20px', fontSize: '15px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  input: { padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  textarea: { padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '250px', resize: 'vertical', fontFamily: 'monospace' },
  button: { padding: '14px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  buttonDisabled: { padding: '14px', fontSize: '16px', backgroundColor: '#8cdb9e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold', marginTop: '10px' },
  error: { color: 'red', fontSize: '14px', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc', marginBottom: '15px' }
};

export default SubmitLog;