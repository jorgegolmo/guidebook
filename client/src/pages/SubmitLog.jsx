// /client/src/pages/SubmitLog.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logService from '../services/logService'; 

// --- Extracted Child Components ---

const CreateSessionForm = ({ onSessionCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title) return setError('Please provide a title for the new session.');

    try {
      setIsSubmitting(true);
      const newSession = await logService.createSession(aiModel, title);
      onSessionCreated(newSession);
      setTitle('');
      setAiModel('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
      <h3 style={{ marginTop: 0 }}>Create New Session</h3>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Session Title *</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Essay Brainstorming, Code Debugging" 
            style={styles.input} 
            disabled={isSubmitting}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>AI Model (optional)</label>
          <input 
            value={aiModel} 
            onChange={(e) => setAiModel(e.target.value)} 
            placeholder="e.g., gpt-4o, claude-3, gemini" 
            style={styles.input} 
            disabled={isSubmitting}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={isSubmitting ? styles.buttonDisabled : styles.button} disabled={isSubmitting}>
            Create
          </button>
          <button type="button" onClick={onCancel} style={styles.buttonSecondary} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AddEntryForm = ({ selectedSession, onEntryAdded }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSession) return setError('Please select a session first.');
    if (!prompt) return setError('Please enter a prompt.');

    try {
      setIsSubmitting(true);
      const added = await logService.addEntry(selectedSession._id, prompt, response || null);
      onEntryAdded(added);
      setPrompt('');
      setResponse('');
      setSuccess('Entry added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedSession) return null;

  return (
    <div>
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Add Entry to: {selectedSession.title}</h3>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Prompt *</label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            style={styles.textarea} 
            disabled={isSubmitting} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>AI Response (optional)</label>
          <textarea 
            value={response} 
            onChange={(e) => setResponse(e.target.value)} 
            style={{ ...styles.textarea, minHeight: '120px' }} 
            disabled={isSubmitting} 
          />
        </div>

        <div>
          <button type="submit" style={isSubmitting ? styles.buttonDisabled : styles.button} disabled={isSubmitting}>
            Add Prompt to Session
          </button>
        </div>
      </form>
    </div>
  );
};

const SessionEntriesList = ({ session }) => {
  if (!session) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Previous Entries</h3>
      <p style={{ color: '#666' }}>AI: <strong>{session.aiModel || 'Not specified'}</strong> — {session.entries?.length || 0} entries</p>

      <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
        {session.entries && session.entries.length ? session.entries.map((e, i) => (
          <div key={i} style={{ padding: '15px', borderRadius: '6px', background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057', fontSize: '0.9em' }}>
              {new Date(e.createdAt).toLocaleString()}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '12px', fontWeight: '500' }}>
              <span style={{color: '#0056b3'}}>Q:</span> {e.prompt}
            </div>
            {e.response && (
              <div style={{ whiteSpace: 'pre-wrap', color: '#333', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                <span style={{color: '#28a745'}}>A:</span> {e.response}
              </div>
            )}
          </div>
        )) : <p style={{ color: '#666', fontStyle: 'italic' }}>No entries yet for this session.</p>}
      </div>
    </div>
  );
};

// --- Main Component ---

const SubmitLog = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
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

  const handleSessionCreated = (newSession) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSession(newSession);
    setCreatingNew(false);
  };

  const handleEntryAdded = (newEntry) => {
    setSessions((prevSessions) => prevSessions.map((s) => {
      if (s._id === selectedSession._id) {
        const updatedSession = { 
          ...s, 
          entries: [...(s.entries || []), newEntry], 
          updatedAt: new Date().toISOString() 
        };
        setSelectedSession(updatedSession); // keep local view updated
        return updatedSession;
      }
      return s;
    }));
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
          Select an existing session to add entries, or create a new session.
        </p>

        {/* Session Selection Area */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1 }}>
            <label style={{...styles.label, display: 'block', marginBottom: '5px'}}>Select Session</label>
            <select
              value={selectedSession?._id || ''}
              onChange={(e) => {
                const id = e.target.value;
                const s = sessions.find(x => x._id === id);
                setSelectedSession(s || null);
                setCreatingNew(false);
              }}
              style={{ padding: '10px', width: '100%', maxWidth: '400px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Select existing session --</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>{s.title || s.aiModel} ({s.entries?.length || 0} entries)</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '22px' }}>
            <button 
              style={styles.buttonSecondary} 
              onClick={() => { setCreatingNew(true); setSelectedSession(null); }}
            >
              + Create New Session
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on state */}
        {creatingNew && (
          <CreateSessionForm 
            onSessionCreated={handleSessionCreated} 
            onCancel={() => setCreatingNew(false)} 
          />
        )}

        {!creatingNew && selectedSession && (
          <>
            <AddEntryForm 
              selectedSession={selectedSession} 
              onEntryAdded={handleEntryAdded} 
            />
            <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />
            <SessionEntriesList session={selectedSession} />
          </>
        )}
        
        {!creatingNew && !selectedSession && (
           <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
             <p style={{ color: '#666', margin: 0 }}>Please select a session from the dropdown above or create a new one.</p>
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
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  input: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  textarea: { padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '120px', resize: 'vertical', fontFamily: 'monospace' },
  button: { padding: '12px 20px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  buttonSecondary: { padding: '12px 20px', fontSize: '16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { padding: '12px 20px', fontSize: '16px', backgroundColor: '#8cdb9e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold' },
  error: { color: '#d32f2f', fontSize: '14px', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc', marginBottom: '15px' },
  success: { color: '#2e7d32', fontSize: '14px', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', border: '1px solid #90ee90', marginBottom: '15px' }
};

export default SubmitLog;