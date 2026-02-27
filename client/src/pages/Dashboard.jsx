// /client/src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import logService from '../services/logService';
import Guidelines from '../components/Guidelines.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLog, setActiveLog] = useState(null); // for viewing log details

  // Fetch logs when the dashboard loads
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const fetchedLogs = await logService.getLogs();
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('Could not load your AI usage data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to process real MongoDB dates into Chart data
  const getChartData = () => {
    const monthCounts = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
      'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
    };

    logs.forEach(log => {
      const date = new Date(log.createdAt);
      // Get the short month name (e.g., "Jan", "Feb")
      const month = date.toLocaleString('default', { month: 'short' });
      if (monthCounts[month] !== undefined) {
        monthCounts[month]++;
      }
    });

    return {
      labels: Object.keys(monthCounts),
      datasets: [
        {
          label: 'AI Interactions',
          data: Object.values(monthCounts),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // we'll show a clickable list of guidelines via the shared component


  if (isLoading) return <div style={styles.center}>Loading your dashboard...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Your Activity Dashboard</h2>
        <Link to="/log-usage" style={styles.button}>
          + Log New AI Usage
        </Link>
      </header>

      <div style={styles.grid}>
        {/* Left Column: Chart and Recent Logs */}
        <div style={styles.mainColumn}>
          <div style={styles.card}>
            <h3>Usage Over Time</h3>
            <div style={styles.chartContainer}>
              <Bar 
                data={getChartData()} 
                options={{ maintainAspectRatio: false }} 
              />
            </div>
          </div>

          <div style={styles.card}>
            <h3>Recent AI Logs</h3>
            {logs.length === 0 ? (
              <p style={{ color: '#555' }}>You haven't logged any AI usage yet. Click the button above to start!</p>
            ) : (
              <ul style={styles.logList}>
                {logs.map(log => (
                  <li
                    key={log._id}
                    style={{ ...styles.logItem, cursor: 'pointer' }}
                    onClick={() => setActiveLog(log)}
                  >
                    <strong>{log.topic}</strong>
                    <span style={styles.dateText}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Guidelines widget */}
        <div style={styles.sideColumn}>
          <Guidelines />
        </div>

        {/* Log detail modal (reuses similar overlay styles) */}
        {activeLog && (
          <div style={styles.fullScreenModal} onClick={() => setActiveLog(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>{activeLog.topic}</h2>
              <p style={styles.modalText}>{activeLog.transcript}</p>
              <p style={{ fontSize: '0.9rem', color: '#888' }}>
                Logged on {new Date(activeLog.createdAt).toLocaleString()}
              </p>
              <button
                style={styles.closeButton}
                onClick={() => setActiveLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  center: { textAlign: 'center', marginTop: '50px', fontSize: '18px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  button: { padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  mainColumn: { flex: '2', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px' },
  sideColumn: { flex: '1', minWidth: '250px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  chartContainer: { height: '300px', marginTop: '15px' },
  logList: { listStyle: 'none', padding: 0, margin: 0 },
  logItem: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' },
  dateText: { color: '#888', fontSize: '14px' },
  guidelineList: { listStyle: 'none', padding: 0, margin: 0 },
  guidelineItem: { marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
  guidelineDesc: { margin: '5px 0 0 0', fontSize: '14px', color: '#555', lineHeight: '1.4' },

  // reuse modal styles from Guidelines component so the look is consistent
  fullScreenModal: {
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  modalTitle: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px'
  },
  modalText: {
    fontSize: '1.2rem',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'left'
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

export default Dashboard;