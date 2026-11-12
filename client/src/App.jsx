import React, { useEffect, useState } from 'react';
import { checkHealth } from './services/api';
import './styles/App.css';

function App() {
  const [health, setHealth] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await checkHealth();
      if (res.ok) {
        setHealth({ loading: false, data: res.data, error: null });
      } else {
        setHealth({
          loading: false,
          data: null,
          error: res.error || 'Could not connect to backend API',
        });
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="brand">
          <span className="brand-title">JobConnect</span>
          <span className="brand-tagline">Connecting talent with opportunities.</span>
        </div>
        <span className="badge">Phase 1: Foundation Active</span>
      </header>

      <main className="main-content">
        <section className="hero-card">
          <h1 className="hero-title">Recruitment Platform Foundation</h1>
          <p className="hero-subtitle">
            Auspify Technologies Internship Advanced Project — Built with React.js, Node.js, Express, and MySQL.
          </p>
          <div className="badge-row">
            <span className="badge">React 18 + Vite</span>
            <span className="badge">Node.js + Express (ES Modules)</span>
            <span className="badge">MySQL 8.0 (InnoDB)</span>
            <span className="badge">JWT Ready</span>
          </div>
        </section>

        <section className="grid-two">
          <div className="card">
            <div className="card-title">
              <span>API Health Status</span>
              <span
                className={`status-pill ${
                  health.loading
                    ? 'status-checking'
                    : health.data
                    ? 'status-online'
                    : 'status-checking'
                }`}
              >
                {health.loading ? 'Checking...' : health.data ? 'Healthy (200)' : 'Offline'}
              </span>
            </div>
            <ul className="detail-list">
              <li className="detail-item">
                <span className="detail-label">Endpoint:</span>
                <span className="detail-value">GET /api/health</span>
              </li>
              <li className="detail-item">
                <span className="detail-label">Server Timestamp:</span>
                <span className="detail-value">
                  {health.data?.timestamp ? new Date(health.data.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </li>
              <li className="detail-item">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{health.data?.service || 'Connecting...'}</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="card-title">
              <span>Database Status</span>
              <span
                className={`status-pill ${
                  health.data?.database?.connected ? 'status-online' : 'status-checking'
                }`}
              >
                {health.data?.database?.connected ? 'Connected' : 'Pending'}
              </span>
            </div>
            <ul className="detail-list">
              <li className="detail-item">
                <span className="detail-label">Database Name:</span>
                <span className="detail-value">jobconnect_db</span>
              </li>
              <li className="detail-item">
                <span className="detail-label">Tables Verified:</span>
                <span className="detail-value">{health.data?.database?.tableCount ?? '...'} tables</span>
              </li>
              <li className="detail-item">
                <span className="detail-label">Connection Pool:</span>
                <span className="detail-value">mysql2 / 10 connections</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        JobConnect &copy; {new Date().getFullYear()} Auspify Technologies Internship. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
