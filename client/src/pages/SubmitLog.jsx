// /client/src/pages/SubmitLog.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logService from '../services/logService'; // 1. Import the real API service

const SubmitLog = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [aiModel, setAiModel] = useState('');
  const [title, setTitle] = useState('');

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await logService.getSessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Could not load sessions', err);
      }
    };
    load();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title) return setErrorMessage('Please provide a title for the new session.');

    try {
      setIsSubmitting(true);
      const newSession = await logService.createSession(aiModel, title || '');
      setSessions((s) => [newSession, ...s]);
      setSelectedSession(newSession);
      setCreatingNew(false);
      setTitle('');
      setAiModel('');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedSession) return setErrorMessage('Please select or create a session first.');
    if (!prompt) return setErrorMessage('Please enter a prompt.');

    try {
      setIsSubmitting(true);
      const added = await logService.addEntry(selectedSession._id, prompt, response || null);

      // update local sessions state: find session and push entry
      setSessions((prev) => prev.map((s) => {
        if (s._id === selectedSession._id) {
          const updated = { ...s, entries: [...(s.entries || []), added], updatedAt: new Date().toISOString() };
          setSelectedSession(updated);
          return updated;
        }
        return s;
      }));

      setPrompt('');
      setResponse('');
      setSuccessMessage('Entry added to session.');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to add entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Manage AI Sessions</h2>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          &larr; Back to Dashboard
        </button>
      </div>

      <div style={styles.card}>
        <p style={styles.instructions}>
          Create sessions (specify the AI model) and add multiple prompt/response pairs per session.
        </p>

        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
          <div>
            <label style={styles.label}>Select Session</label>
            <div>
              <select
                value={selectedSession?._id || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  const s = sessions.find(x => x._id === id);
                  setSelectedSession(s || null);
                  setCreatingNew(false);
                }}
                style={{ padding: '10px', minWidth: '260px' }}
              >
                <option value="">-- select existing session --</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>{s.title || `${s.aiModel} (${s.entries?.length || 0} entries)`}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button style={styles.buttonSecondary} onClick={() => { setCreatingNew(true); setSelectedSession(null); }}>
              + Create New Session
            </button>
          </div>
        </div>

        {creatingNew && (
          <form onSubmit={handleCreateSession} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Session Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Essay Brainstorming, Code Debugging" style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>AI Model (optional)</label>
              <input value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="e.g., gpt-4o, claude-3, gemini" style={styles.input} />
            </div>
            <div>
              <button type="submit" style={isSubmitting ? styles.buttonDisabled : styles.button} disabled={isSubmitting}>Create Session</button>
            </div>
          </form>
        )}

        {/* Add Entry */}
        <hr style={{ margin: '20px 0' }} />
        <form onSubmit={handleAddEntry} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Prompt *</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={styles.textarea} disabled={isSubmitting} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>AI Response (optional)</label>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} style={{ ...styles.textarea, minHeight: '120px' }} disabled={isSubmitting} />
          </div>

          <div>
            <button type="submit" style={isSubmitting ? styles.buttonDisabled : styles.button} disabled={isSubmitting}>Add Prompt to Session</button>
          </div>
        </form>

        {/* Show selected session entries */}
        {selectedSession && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginTop: 0 }}>{selectedSession.title || selectedSession.aiModel}</h3>
            <p style={{ color: '#666' }}>AI: <strong>{selectedSession.aiModel}</strong> — {selectedSession.entries?.length || 0} entries</p>

            <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
              {selectedSession.entries && selectedSession.entries.length ? selectedSession.entries.map((e, i) => (
                <div key={i} style={{ padding: '12px', borderRadius: '6px', background: '#fff', border: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{new Date(e.createdAt).toLocaleString()}</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>{e.prompt}</div>
                  {e.response && <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{e.response}</div>}
                </div>
              )) : <p style={{ color: '#666' }}>No entries yet for this session.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Inline styles 
const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backButton: { background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: '16px', textDecoration: 'underline' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #ccc', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  instructions: { color: '#555', marginBottom: '20px', fontSize: '15px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  input: { padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  textarea: { padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '120px', resize: 'vertical', fontFamily: 'monospace' },
  button: { padding: '14px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  buttonDisabled: { padding: '14px', fontSize: '16px', backgroundColor: '#8cdb9e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold', marginTop: '10px' },
  error: { color: '#d32f2f', fontSize: '14px', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc', marginBottom: '15px' },
  success: { color: '#2e7d32', fontSize: '14px', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', border: '1px solid #90ee90', marginBottom: '15px' }
};

export default SubmitLog;