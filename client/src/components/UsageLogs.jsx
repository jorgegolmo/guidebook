import React, { useState, useEffect } from 'react';
import logService from '../services/logService';

const UsageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [activeLog, setActiveLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load logs from server on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await logService.getLogs();
        setLogs(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Could not fetch logs:', err);
        setError('Failed to load logs. Please try again.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Usage Logs</h3>
        <p style={{ textAlign: 'center', color: '#666' }}>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Usage Logs</h3>
        <p style={{ textAlign: 'center', color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.header}>Usage Logs</h3>
        <p style={{ textAlign: 'center', color: '#666' }}>No logs recorded yet. Start by submitting a log!</p>
      </div>
    );
  }

  return (
    <div style={styles.sectionContainer}>
      <h3 style={styles.header}>Usage Logs</h3>
      
      {/* The Log Grid */}
      <div style={styles.logGrid}>
        {logs.map((log, index) => (
          <button 
            key={log._id || index} 
            style={styles.logButton}
            onClick={() => setActiveLog(log)}
          >
            <div style={styles.logButtonTitle}>{log.topic}</div>
            <div style={styles.logButtonDate}>
              {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
            </div>
          </button>
        ))}
      </div>

      {/* The Full-Screen Modal Overlay */}
      {activeLog && (
        <div style={styles.fullScreenModal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{activeLog.topic}</h2>
            <div style={styles.logMetadata}>
              <p><strong>Date:</strong> {new Date(activeLog.createdAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(activeLog.createdAt).toLocaleTimeString()}</p>
            </div>
            <div style={styles.transcriptSection}>
              <h3 style={styles.transcriptTitle}>Transcript</h3>
              <p style={styles.modalText}>{activeLog.transcript}</p>
            </div>
            
            <button 
              style={styles.closeButton} 
              onClick={() => setActiveLog(null)}
            >
              Close Log
            </button>
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
    gap: '8px'
  },
  logButtonTitle: {
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  logButtonDate: {
    fontSize: '0.85rem',
    color: '#666'
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
    padding: '50px',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',        // prevent overflow beyond viewport
    overflowY: 'auto',       // scroll when content is long
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  modalTitle: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px'
  },
  logMetadata: {
    backgroundColor: '#f0f0f0',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  transcriptSection: {
    textAlign: 'left',
    marginBottom: '30px'
  },
  transcriptTitle: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '10px'
  },
  modalText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#555',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  closeButton: {
    padding: '12px 24px',
    fontSize: '1.1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default UsageLogs;
