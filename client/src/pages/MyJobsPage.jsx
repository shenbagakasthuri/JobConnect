import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  IconPlus,
  IconBriefcase,
  IconTrash,
  IconArrowRight,
  IconClock,
  IconMapPin,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchMyJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyJobs();
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async (jobId, jobTitle) => {
    const confirmed = window.confirm(`Permanently remove "${jobTitle}"? This action cannot be reversed.`);
    if (!confirmed) return;

    try {
      const res = await api.deleteJob(jobId);
      if (res.success) {
        setActionMessage(`"${jobTitle}" removed successfully.`);
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err) {
      alert(`Error deleting job: ${err.message}`);
    }
  };

  return (
    <div className="my-jobs-page-wrapper">
      <div className="my-jobs-header-row">
        <div>
          <span className="section-eyebrow">Employer Management</span>
          <h1 className="page-title">My Authored Postings</h1>
          <p className="page-description">Manage active career opportunities published under your company</p>
        </div>
        <Link to="/employer/post-job" className="btn btn-primary">
          <IconPlus size={16} /> Post New Job
        </Link>
      </div>

      {actionMessage && (
        <div className="alert alert-success" role="alert" style={{ background: '#ecfdf5', color: '#065f46', marginBottom: '1.5rem' }}>
          ✓ {actionMessage}
        </div>
      )}

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading && <LoadingSkeleton count={3} />}

      {!loading && !error && jobs.length === 0 && (
        <div className="empty-state-card">
          <IconBriefcase size={40} className="empty-icon" />
          <h3>No Job Postings Yet</h3>
          <p>You haven't published any vacancies. Create your first opening to attract applicants.</p>
          <Link to="/employer/post-job" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            <IconPlus size={16} /> Publish Your First Role
          </Link>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="modern-table-card">
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Job Title & Organization</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="table-title-cell">
                        <Link to={`/jobs/${job.id}`} className="job-table-title">
                          {job.title}
                        </Link>
                        <span className="job-table-company">{job.company_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-location">
                        <IconMapPin size={13} /> {job.location}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-pill badge-type-sm">
                        {job.employment_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-online">
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <span className="cell-date">
                        <IconClock size={13} /> {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-inline">
                        <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-primary btn-sm" title="View Candidate Applications">
                          Applicants
                        </Link>
                        <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm" title="Preview Public View">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="btn btn-danger-ghost btn-sm"
                          title="Delete posting"
                        >
                          <IconTrash size={14} /> Delete
                        </button>
                      </div>
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

export default MyJobsPage;
