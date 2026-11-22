import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconSearch,
  IconBriefcase,
  IconPlus,
  IconBuilding,
  IconUser,
  IconCheckCircle,
  IconShield,
  IconArrowRight,
} from '../components/Icons';

export const DashboardPage = () => {
  const { user } = useAuth();
  const isSeeker = user?.role === 'JOB_SEEKER';
  const isEmployer = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="dashboard-page-wrapper">
      {/* User Hero Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="hero-avatar-box">
            {isEmployer ? <IconBuilding size={28} /> : <IconUser size={28} />}
          </div>
          <div>
            <div className="badge-row-user">
              <span className="user-role-tag">{user?.role?.replace('_', ' ')}</span>
              <span className="user-status-tag">Status: {user?.accountStatus || 'ACTIVE'}</span>
            </div>
            <h1 className="dashboard-welcome-heading">Welcome back, {user?.fullName}!</h1>
            <p className="dashboard-email-sub">{user?.email}</p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          {isSeeker && (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Link to="/jobs" className="btn btn-primary">
                <IconSearch size={16} /> Browse Opportunities
              </Link>
              <Link to="/my-applications" className="btn btn-outline">
                <IconBriefcase size={16} /> My Applications
              </Link>
            </div>
          )}

          {isEmployer && (
            <div className="employer-action-group">
              <Link to="/employer/post-job" className="btn btn-primary">
                <IconPlus size={16} /> Post a Vacancy
              </Link>
              <Link to="/employer/my-jobs" className="btn btn-outline">
                Manage Listings
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Workspaces */}
      {isSeeker && (
        <div className="dashboard-cards-grid">
          <div className="dashboard-widget-card highlight-card">
            <div className="widget-header">
              <IconSearch size={22} className="widget-icon" />
              <h3>Find Your Next Role</h3>
            </div>
            <p className="widget-text">
              Search verified job openings across engineering, product, marketing, and remote positions.
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Explore Career Board <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-widget-card">
            <div className="widget-header">
              <IconBriefcase size={22} className="widget-icon" />
              <h3>My Applications</h3>
            </div>
            <p className="widget-text">
              Track the progress of applications, reviews, and recruitment milestones.
            </p>
            <Link to="/my-applications" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              View Applied Jobs <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-widget-card">
            <div className="widget-header">
              <IconUser size={22} className="widget-icon" />
              <h3>Profile & Resume</h3>
            </div>
            <p className="widget-text">
              Your seeker account profile is registered in the database and tied to your user ID.
            </p>
            <div className="meta-info-list">
              <div className="meta-info-item">
                <span>Account ID:</span>
                <strong>#{user?.id}</strong>
              </div>
              <div className="meta-info-item">
                <span>Verification:</span>
                <strong style={{ color: '#059669' }}>Active & Verified</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmployer && (
        <div className="dashboard-cards-grid">
          <div className="dashboard-widget-card highlight-card">
            <div className="widget-header">
              <IconPlus size={22} className="widget-icon" />
              <h3>Publish an Opening</h3>
            </div>
            <p className="widget-text">
              Create a job posting with location, experience level, salary range, and comprehensive requirements.
            </p>
            <Link to="/employer/post-job" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Create Job Posting <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-widget-card">
            <div className="widget-header">
              <IconBuilding size={22} className="widget-icon" />
              <h3>Manage Your Listings</h3>
            </div>
            <p className="widget-text">
              Monitor active roles, review vacancy details, and manage listings you've authored.
            </p>
            <Link to="/employer/my-jobs" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              View Postings Table <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-widget-card">
            <div className="widget-header">
              <IconUser size={22} className="widget-icon" />
              <h3>Applicant Pipeline</h3>
            </div>
            <p className="widget-text">
              Review candidate submissions, resume attachments, and update recruitment statuses.
            </p>
            <Link to="/employer/my-jobs" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Inspect Candidates by Job <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="dashboard-cards-grid">
          <div className="dashboard-widget-card highlight-card">
            <div className="widget-header">
              <IconShield size={22} className="widget-icon" />
              <h3>Platform Administration</h3>
            </div>
            <p className="widget-text">
              You are signed in as an administrator. Admin monitoring dashboards and moderation tools will be enabled in Phase 7.
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Inspect Public Board
            </Link>
          </div>
        </div>
      )}

      {/* Security Info Card */}
      <div className="dashboard-security-card">
        <IconShield size={20} className="shield-icon" />
        <div className="security-text">
          <strong>Security Status: Authenticated Session</strong>
          <p>
            Your session is secured with an HttpOnly SameSite cookie and cryptographically verified JWT claims.
            Role-based authorization prevents unauthorized resource access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
