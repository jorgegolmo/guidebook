import React, { useState, useEffect } from 'react';
import logService from '../services/logService';

const UsageLogs = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load sessions from server on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await logService.getSessions();
        setSessions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Could not fetch sessions:', err);
        setError('Failed to load sessions. Please try again.');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Truncate text to a certain length for preview
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Your Sessions</h3>
        <p style={{ textAlign: 'center', color: '#666' }}>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Your Sessions</h3>
        <p style={{ textAlign: 'center', color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Your Sessions</h3>
        <p style={{ textAlign: 'center', color: '#666' }}>No sessions yet. Create one to start logging prompts.</p>
      </div>
    );
  }

  return (
    <div style={styles.sectionContainer}>
      <h3 style={styles.header}>Your Sessions ({sessions.length})</h3>

      {/* The Session Grid */}
      <div style={styles.logGrid}>
        {sessions.map((s, idx) => (
          <button key={s._id || idx} style={styles.logButton} onClick={() => setActiveSession(s)}>
            <div style={{ fontWeight: 'bold', color: '#0056b3' }}>{s.title || s.aiModel}</div>
            <div style={{ color: '#666' }}>AI: {s.aiModel}</div>
            <div style={styles.logButtonDate}>{(s.entries?.length || 0)} entries</div>
          </button>
        ))}
      </div>

      {/* Session details modal */}
      {activeSession && (
        <div style={styles.fullScreenModal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{activeSession.title || activeSession.aiModel}</h2>
            <p style={{ color: '#666' }}>AI: <strong>{activeSession.aiModel}</strong></p>

            <div style={{ marginTop: '20px' }}>
              {activeSession.entries && activeSession.entries.length ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {activeSession.entries.map((e, i) => (
                    <div key={i} style={{ padding: '12px', borderRadius: '6px', background: '#fff', border: '1px solid #eee' }}>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '6px' }}>{new Date(e.createdAt).toLocaleString()}</div>
                      <div style={{ fontWeight: '600', marginBottom: '6px' }}>{truncateText(e.prompt, 300)}</div>
                      {e.response && <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{truncateText(e.response, 800)}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No entries in this session yet.</p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button style={styles.closeButton} onClick={() => setActiveSession(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS-in-JS Styles
const styles = {
  sectionContainer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  header: {
    marginTop: '0',
    color: '#333',
    marginBottom: '20px'
  },
  logGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px'
  },
  logButton: {
    padding: '15px',
    fontSize: '0.95rem',
    color: '#0056b3',
    backgroundColor: '#fff',
    border: '2px solid #0056b3',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '100px',
    justifyContent: 'space-between'
  },
  logButtonPreview: {
    fontWeight: '500',
    fontSize: '0.95rem',
    color: '#333',
    lineHeight: '1.4'
  },
  logButtonDate: {
    fontSize: '0.8rem',
    color: '#999'
  },
  
  // Full-Screen Modal Styles
  fullScreenModal: {
    position: 'fixed',
    top: '60px',             // leave room for the fixed navbar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark transparent background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000 // sits beneath the navbar but above page content
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',        // prevent overflow beyond viewport
    overflowY: 'auto',       // scroll when content is long
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  modalTitle: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '30px',
    marginTop: 0
  },
  promptSection: {
    marginBottom: '25px'
  },
  responseSection: {
    marginBottom: '25px',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '6px'
  },
  sectionLabel: {
    fontSize: '1rem',
    color: '#0056b3',
    marginBottom: '10px',
    marginTop: 0,
    fontWeight: 'bold'
  },
  modalText: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#555',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginTop: 0,
    marginBottom: 0
  },
  logMetadata: {
    backgroundColor: '#f0f0f0',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    color: '#666'
  },
  closeButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default UsageLogs;
