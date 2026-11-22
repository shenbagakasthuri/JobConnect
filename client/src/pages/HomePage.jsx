import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IconSearch,
  IconMapPin,
  IconBriefcase,
  IconCheckCircle,
  IconArrowRight,
  IconShield,
  IconBuilding,
  IconUser,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchParams, setSearchParams] = useState({ keyword: '', location: '' });

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        const res = await api.getJobs();
        if (res.success && Array.isArray(res.data)) {
          // Take the latest 3 active jobs for the homepage showcase
          setRecentJobs(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching recent jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadFeaturedJobs();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchParams.keyword.trim()) query.append('keyword', searchParams.keyword.trim());
    if (searchParams.location.trim()) query.append('location', searchParams.location.trim());
    navigate(`/jobs${query.toString() ? `?${query.toString()}` : ''}`);
  };

  return (
    <div className="home-page-wrapper">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Auspify Recruitment Platform
          </div>
          <h1 className="hero-heading">
            Connecting exceptional talent with <span className="gradient-text">ambitious opportunities</span>.
          </h1>
          <p className="hero-subtext">
            JobConnect streamlines recruitment for job seekers and hiring managers with
            role-based workflows, transparent salary indicators, and instant discovery.
          </p>

          {/* Hero Quick Search Bar */}
          <form onSubmit={handleHeroSearch} className="hero-search-bar">
            <div className="hero-input-group">
              <IconSearch className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Job title, skill, or keyword"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              />
            </div>
            <div className="hero-input-divider"></div>
            <div className="hero-input-group">
              <IconMapPin className="input-icon" size={20} />
              <input
                type="text"
                placeholder="City or Remote"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary hero-submit-btn">
              Search Jobs
            </button>
          </form>

          {/* Quick Stats or CTA Row */}
          <div className="hero-cta-row">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Your Dashboard ({user?.role?.replace('_', ' ')}) →
              </Link>
            ) : (
              <div className="auth-quick-actions">
                <span>Looking to hire?</span>
                <Link to="/register" className="link-action">
                  Post a vacancy as an Employer <IconArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Live Job Openings Showcase */}
      <section className="section-featured-jobs">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest Verified Positions</h2>
            <p className="section-subtitle">Real opportunities active on the platform right now</p>
          </div>
          <Link to="/jobs" className="btn btn-outline btn-sm">
            View All Jobs <IconArrowRight size={16} />
          </Link>
        </div>

        {loadingJobs && <LoadingSkeleton count={3} />}

        {!loadingJobs && recentJobs.length === 0 && (
          <div className="empty-state-card">
            <IconBriefcase size={36} className="empty-icon" />
            <h3>No jobs currently listed</h3>
            <p>Be the first employer to list an opening or check back shortly.</p>
            {user?.role === 'EMPLOYER' && (
              <Link to="/employer/post-job" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Post a Job Now
              </Link>
            )}
          </div>
        )}

        {!loadingJobs && recentJobs.length > 0 && (
          <div className="featured-jobs-grid">
            {recentJobs.map((job) => (
              <div key={job.id} className="featured-job-card">
                <div className="card-top">
                  <div className="company-info">
                    <span className="company-name">{job.company_name}</span>
                    <h3 className="job-title">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                  </div>
                  <span className="badge badge-pill badge-type">{job.employment_type.replace('_', ' ')}</span>
                </div>

                <div className="card-meta">
                  <span className="meta-badge">
                    <IconMapPin size={14} /> {job.location}
                  </span>
                  <span className="meta-badge">🎯 {job.experience_level}</span>
                  {(job.salary_min || job.salary_max) && (
                    <span className="meta-badge salary-badge">
                      ₹{Number(job.salary_min || 0).toLocaleString()} - ₹{Number(job.salary_max || 0).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="card-bottom">
                  <span className="posted-time">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. How It Works Section */}
      <section className="section-how-it-works">
        <div className="section-header-center">
          <span className="section-eyebrow">Workflows Built for Speed</span>
          <h2 className="section-title">How JobConnect Works</h2>
          <p className="section-subtitle">A straightforward recruitment process designed for clarity and security</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Create an Account</h3>
            <p className="step-desc">
              Register as a Job Seeker to apply for roles, or as an Employer to manage hiring pipelines.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Discover or Publish</h3>
            <p className="step-desc">
              Search by title, location, and type, or publish comprehensive role descriptions with compensation details.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Connect & Track</h3>
            <p className="step-desc">
              Manage your applications and postings directly with protected role-based controls and active session security.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Value Propositions for Both Roles */}
      <section className="section-value-props">
        <div className="grid-two">
          <div className="value-card seeker-value">
            <div className="value-header">
              <IconUser size={24} className="val-icon" />
              <h3>For Job Seekers</h3>
            </div>
            <p className="value-intro">Access curated roles with direct employer visibility.</p>
            <ul className="value-checklist">
              <li>
                <IconCheckCircle size={18} /> Verified active listings from registered organizations
              </li>
              <li>
                <IconCheckCircle size={18} /> Clean filters for remote, full-time, and internships
              </li>
              <li>
                <IconCheckCircle size={18} /> Transparent compensation and skill requirements
              </li>
            </ul>
            <Link to="/jobs" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
              Explore Career Openings
            </Link>
          </div>

          <div className="value-card employer-value">
            <div className="value-header">
              <IconBuilding size={24} className="val-icon" />
              <h3>For Employers & Recruiters</h3>
            </div>
            <p className="value-intro">Publish roles and reach focused talent with zero clutter.</p>
            <ul className="value-checklist">
              <li>
                <IconCheckCircle size={18} /> Dedicated dashboard to manage, track, and update openings
              </li>
              <li>
                <IconCheckCircle size={18} /> Role-based authentication ensuring full ownership
              </li>
              <li>
                <IconCheckCircle size={18} /> Clean application tracking foundation
              </li>
            </ul>
            <Link to="/employer/post-job" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Post a Role Today
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Security & Trust Banner */}
      <section className="section-trust">
        <div className="trust-container">
          <div className="trust-icon-wrapper">
            <IconShield size={32} />
          </div>
          <div className="trust-text">
            <h3>Enterprise-Grade Architecture</h3>
            <p>
              JobConnect employs JWT authentication stored in HttpOnly SameSite cookies, bcrypt password hashing,
              parameterized MySQL queries, and strict role authorization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
