import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  IconBriefcase,
  IconBuilding,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconCheckCircle,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyApplications();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span
            className="status-pill"
            style={{ background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}
          >
            Accepted
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span
            className="status-pill"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--secondary)' }}
          >
            Shortlisted
          </span>
        );
      case 'REVIEWED':
        return (
          <span
            className="status-pill"
            style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}
          >
            Reviewed
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="status-pill"
            style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
          >
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span
            className="status-pill"
            style={{ background: 'var(--surface-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Pending
          </span>
        );
    }
  };

  return (
    <div className="my-applications-page-wrapper">
      <div className="page-header-row">
        <div>
          <span className="section-eyebrow">Candidate Tracker</span>
          <h1 className="page-title">My Submitted Applications</h1>
          <p className="page-description">
            Monitor real-time employer reviews, shortlist updates, and recruitment statuses
          </p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Explore More Jobs
        </Link>
      </div>

      {loading && <LoadingSkeleton count={3} />}

      {error && (
        <div className="error-state-card">
          <h3>Failed to load applications</h3>
          <p>{error}</p>
          <button onClick={fetchApplications} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="empty-state-card">
          <IconBriefcase size={40} className="empty-icon" />
          <h3>No applications submitted yet</h3>
          <p>You haven't applied to any job openings yet. Start exploring active vacancies today.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Browse Active Jobs <IconArrowRight size={14} />
          </Link>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="modern-table-card">
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Job Title & Organization</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Application Status</th>
                  <th>Resume Attached</th>
                  <th>Applied On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="table-title-cell">
                        <Link to={`/jobs/${app.job_id}`} className="job-table-title">
                          {app.job_title}
                        </Link>
                        <span className="job-table-company">{app.company_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-location">
                        <IconMapPin size={13} /> {app.job_location}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-pill badge-type-sm">
                        {app.employment_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{getStatusBadge(app.application_status)}</td>
                    <td>
                      {app.has_resume ? (
                        <a
                          href={api.getResumeDownloadUrl(app.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-download-link"
                          style={{ fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          📄 Download Resume
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span className="cell-date">
                        <IconClock size={13} /> {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/jobs/${app.job_id}`} className="btn btn-ghost btn-sm">
                        View Job <IconArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
