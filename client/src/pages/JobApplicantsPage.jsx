import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  IconUser,
  IconClock,
  IconBriefcase,
  IconArrowRight,
  IconCheckCircle,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const JobApplicantsPage = () => {
  const { jobId } = useParams();

  const [jobInfo, setJobInfo] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobApplicants(jobId);
      if (res.success) {
        setJobInfo(res.job);
        setApplicants(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load applicants for this position.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setActionNotice(null);
    try {
      const res = await api.updateApplicationStatus(applicationId, newStatus);
      if (res.success) {
        setApplicants((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, application_status: newStatus } : app))
        );
        setActionNotice(`Candidate status updated to ${newStatus}.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="applicants-page-wrapper">
      <nav className="detail-breadcrumb">
        <Link to="/employer/my-jobs" className="back-link">
          ← Back to My Postings
        </Link>
      </nav>

      <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-eyebrow">Recruiter Pipeline</span>
          <h1 className="page-title">
            Applicants for {jobInfo?.title || 'Position'}
          </h1>
          <p className="page-description">
            Review candidate qualifications, cover letters, attached resumes, and update hiring statuses.
          </p>
        </div>
        <Link to={`/jobs/${jobId}`} className="btn btn-outline btn-sm">
          View Public Posting <IconArrowRight size={14} />
        </Link>
      </div>

      {actionNotice && (
        <div className="alert alert-success" style={{ background: '#ecfdf5', color: '#065f46', marginBottom: '1.25rem' }}>
          ✓ {actionNotice}
        </div>
      )}

      {loading && <LoadingSkeleton count={3} />}

      {error && (
        <div className="error-state-card">
          <h3>Failed to load candidate list</h3>
          <p>{error}</p>
          <button onClick={fetchApplicants} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && applicants.length === 0 && (
        <div className="empty-state-card">
          <IconUser size={40} className="empty-icon" />
          <h3>No applications received yet</h3>
          <p>This vacancy has not received candidate submissions yet. Make sure your role details are compelling!</p>
          <Link to="/employer/my-jobs" className="btn btn-outline btn-sm" style={{ marginTop: '1.25rem' }}>
            Back to Postings
          </Link>
        </div>
      )}

      {!loading && applicants.length > 0 && (
        <div className="applicants-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {applicants.map((app) => (
            <div key={app.id} className="modern-job-card applicant-review-card">
              <div className="job-card-header">
                <div>
                  <h3 className="job-title-heading" style={{ fontSize: '1.2rem' }}>
                    {app.applicant_name}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ✉️ {app.applicant_email}
                  </span>
                </div>

                <div className="status-control-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor={`status-${app.id}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    STATUS:
                  </label>
                  <select
                    id={`status-${app.id}`}
                    value={app.application_status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--surface-border)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      background: '#ffffff',
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ACCEPTED">Accepted</option>
                  </select>
                </div>
              </div>

              {app.cover_letter && (
                <div
                  className="applicant-cover-letter-box"
                  style={{
                    background: 'var(--surface-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    margin: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#334155',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Candidate Note / Cover Letter:
                  </strong>
                  {app.cover_letter}
                </div>
              )}

              <div className="job-card-actions" style={{ marginTop: '0.5rem' }}>
                <span className="date-indicator">
                  <IconClock size={14} /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                </span>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {app.has_resume ? (
                    <a
                      href={api.getResumeDownloadUrl(app.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      📄 Download Candidate Resume
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      No resume attached
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;
