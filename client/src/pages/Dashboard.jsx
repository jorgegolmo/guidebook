// /client/src/pages/Dashboard.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import logService from '../services/logService';
import Guidelines from '../components/Guidelines.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// --- Extracted Business Logic (Pure Function) ---
// This handles data transformation outside of the React render cycle.
const transformLogsToChartData = (logs) => {
  const dayCounts = {};

  logs.forEach(log => {
    const date = new Date(log.createdAt);
    const iso = date.toISOString().split('T')[0]; 
    dayCounts[iso] = (dayCounts[iso] || 0) + 1;
  });

  let sortedIso = Object.keys(dayCounts).sort();

  if (sortedIso.length > 14) {
    sortedIso = sortedIso.slice(-14);
  }

  const labels = sortedIso.map(iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  });

  return {
    labels,
    datasets: [
      {
        label: 'AI Interactions',
        data: sortedIso.map(iso => dayCounts[iso]),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
};


const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLog, setActiveLog] = useState(null); // for viewing log details

  // Fetch sessions (and derive entries) when the dashboard loads
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const sessions = await logService.getSessions();

        // flatten entries across sessions to produce an entries array
        const allEntries = [];
        (sessions || []).forEach((s) => {
          (s.entries || []).forEach((e) => {
            allEntries.push({
              _id: e._id || `${s._id}:${allEntries.length}`,
              prompt: e.prompt,
              response: e.response,
              createdAt: e.createdAt,
              sessionTitle: s.title || s.aiModel,
              aiModel: s.aiModel,
            });
          });
        });

        // sort newest first
        allEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLogs(allEntries);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setError(err.message || 'Could not load your AI usage data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Memoize the chart data so it only recalculates when 'logs' changes,
  // preventing unnecessary recalculations on every component render.
  const chartData = useMemo(() => transformLogsToChartData(logs), [logs]);

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
              <Line
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: 'Date' },
                      grid: { display: false }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        callback: value => Number.isInteger(value) ? value : null
                      },
                      title: { display: true, text: 'Prompts (count)' }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div style={styles.card}>
            <h3>Recent AI Logs</h3>
                {logs.length === 0 ? (
              <p style={{ color: '#555' }}>You haven't logged any AI usage yet. Click the button above to start!</p>
            ) : (
              <ul style={styles.logList}>
                {logs.slice(0, 10).map(log => (
                  <li
                    key={log._id}
                    style={{ ...styles.logItem, cursor: 'pointer' }}
                    onClick={() => setActiveLog(log)}
                  >
                    <div>
                      <strong>{log.prompt.substring(0, 80)}{log.prompt.length > 80 ? '...' : ''}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{log.sessionTitle} — {log.aiModel}</div>
                    </div>
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
                  <h2 style={styles.modalTitle}>{activeLog.prompt.substring(0, 120)}{activeLog.prompt.length > 120 ? '...' : ''}</h2>
                  <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '12px' }}>Session: <strong>{activeLog.sessionTitle}</strong> — {activeLog.aiModel}</p>
                  {activeLog.response && <div style={styles.modalText}>{activeLog.response}</div>}
                  <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '16px' }}>
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