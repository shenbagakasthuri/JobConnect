import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IconBuilding,
  IconMapPin,
  IconBriefcase,
  IconCheckCircle,
  IconShield,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application submission form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getJobById(id);
        if (res.success) {
          setJob(res.data);
        }
      } catch (err) {
        setError(err.message || 'Job not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive / Disclosed on request';
    const formatNumber = (num) => Number(num).toLocaleString();
    if (min && max) return `₹${formatNumber(min)} - ₹${formatNumber(max)} / year`;
    if (min) return `From ₹${formatNumber(min)} / year`;
    return `Up to ₹${formatNumber(max)} / year`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setSubmitError('Invalid file format. Please attach a PDF, DOC, or DOCX document.');
      setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File is too large. Resumes must be smaller than 5 MB.');
      setResumeFile(null);
      return;
    }

    setSubmitError(null);
    setResumeFile(file);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.applyForJob(id, formData);
      if (res.success) {
        setSubmitSuccess(true);
        setShowApplyForm(false);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-loading">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-state-card" style={{ maxWidth: '640px', margin: '3rem auto' }}>
        <IconBriefcase size={40} className="empty-icon" />
        <h2>Position Not Found</h2>
        <p>{error || 'This vacancy may have expired, closed, or been removed by the employer.'}</p>
        <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
          Back to Active Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-details-page-wrapper">
      {/* Back Navigation Breadcrumb */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/jobs" className="back-link">
          ← Back to All Positions
        </Link>
      </nav>

      <div className="job-details-grid">
        {/* Main Column */}
        <main className="job-details-main">
          {/* Header Card */}
          <header className="job-main-header-card">
            <div className="header-badge-row">
              <span className="badge badge-pill badge-type">{job.employment_type.replace('_', ' ')}</span>
              <span className="status-pill status-online">Status: {job.status}</span>
            </div>

            <h1 className="detail-job-title">{job.title}</h1>

            <div className="detail-company-sub">
              <span className="company-name-bold">
                <IconBuilding size={18} /> {job.company_name}
              </span>
              <span className="bullet-sep">•</span>
              <span className="location-info">
                <IconMapPin size={16} /> {job.location}
              </span>
            </div>

            {/* Key Metric Highlights */}
            <div className="detail-key-metrics">
              <div className="metric-box">
                <span className="metric-label">Experience</span>
                <span className="metric-value">{job.experience_level} Level</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Compensation</span>
                <span className="metric-value">{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Deadline</span>
                <span className="metric-value">
                  {job.application_deadline
                    ? new Date(job.application_deadline).toLocaleDateString()
                    : 'Open until filled'}
                </span>
              </div>
            </div>
          </header>

          {/* Description Body Card */}
          <section className="job-body-card">
            <div className="body-section">
              <h2 className="section-heading">Role Overview</h2>
              <div className="prose-content">{job.description}</div>
            </div>

            {job.responsibilities && (
              <div className="body-section">
                <h2 className="section-heading">Core Responsibilities</h2>
                <div className="prose-content">{job.responsibilities}</div>
              </div>
            )}

            {job.requirements && (
              <div className="body-section">
                <h2 className="section-heading">Requirements & Qualifications</h2>
                <div className="prose-content">{job.requirements}</div>
              </div>
            )}
          </section>
        </main>

        {/* Sidebar Column */}
        <aside className="job-details-sidebar">
          {/* Action / Apply Card */}
          <div className="sidebar-card action-card">
            <h3 className="sidebar-card-title">Apply for this Position</h3>
            <p className="sidebar-card-sub">Submit your candidacy directly to {job.company_name}.</p>

            {!isAuthenticated ? (
              <div className="apply-unauth-box">
                <p className="helper-text">
                  You need a verified Job Seeker account to submit an application.
                </p>
                <Link to="/login" className="btn btn-primary btn-block">
                  Sign In to Apply
                </Link>
                <Link to="/register" className="btn btn-outline btn-block" style={{ marginTop: '0.5rem' }}>
                  Create Account
                </Link>
              </div>
            ) : user?.role === 'JOB_SEEKER' ? (
              <div className="apply-seeker-box">
                {submitSuccess ? (
                  <div className="status-notice-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                    <div className="notice-icon" style={{ color: '#059669' }}>
                      <IconCheckCircle size={22} />
                    </div>
                    <div className="notice-text">
                      <strong style={{ color: '#065f46' }}>Application Submitted!</strong>
                      <p style={{ color: '#047857' }}>
                        Your application has been received by {job.company_name}. You can track its status in your dashboard.
                      </p>
                      <Link to="/my-applications" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                        View in My Applications →
                      </Link>
                    </div>
                  </div>
                ) : !showApplyForm ? (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    Apply Now
                  </button>
                ) : (
                  <form onSubmit={handleApplySubmit} className="real-apply-form">
                    {submitError && (
                      <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                        {submitError}
                      </div>
                    )}

                    <div className="form-field-group">
                      <label htmlFor="resume">Resume Document (PDF, DOC, DOCX - max 5MB)</label>
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      {resumeFile && (
                        <div className="file-info-badge" style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.2rem' }}>
                          ✓ Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                        </div>
                      )}
                    </div>

                    <div className="form-field-group" style={{ marginTop: '0.75rem' }}>
                      <label htmlFor="coverLetter">Cover Letter / Note to Recruiter</label>
                      <textarea
                        id="coverLetter"
                        rows="3"
                        placeholder="Briefly highlight relevant experience or motivation..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="btn btn-outline btn-sm"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm btn-block"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting Application...' : 'Send Application'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="apply-employer-notice">
                <p>
                  You are currently logged in with an <strong>{user?.role}</strong> account.
                  Job applications are restricted to Job Seeker accounts.
                </p>
              </div>
            )}
          </div>

          {/* Company Details Card */}
          <div className="sidebar-card company-card">
            <h3 className="sidebar-card-title">About the Employer</h3>
            <p className="company-profile-name">{job.company_name}</p>

            <ul className="company-details-list">
              {job.company_industry && (
                <li>
                  <span className="detail-tag-label">Industry:</span>
                  <span className="detail-tag-val">{job.company_industry}</span>
                </li>
              )}
              {job.company_location && (
                <li>
                  <span className="detail-tag-label">Headquarters:</span>
                  <span className="detail-tag-val">{job.company_location}</span>
                </li>
              )}
            </ul>

            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm btn-block"
                style={{ marginTop: '1rem' }}
              >
                Visit Official Website ↗
              </a>
            )}

            {job.company_description && (
              <p className="company-about-text">{job.company_description}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetailsPage;
