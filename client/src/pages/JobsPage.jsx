import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  IconSearch,
  IconMapPin,
  IconBriefcase,
  IconClock,
  IconBuilding,
  IconArrowRight,
} from '../components/Icons';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    employmentType: searchParams.get('employmentType') || '',
  });

  const fetchJobs = async (filterParams = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobs(filterParams);
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the jobs service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If URL search params were passed from homepage, sync them
    const initialKeyword = searchParams.get('keyword') || '';
    const initialLocation = searchParams.get('location') || '';
    const initialType = searchParams.get('employmentType') || '';

    const currentFilters = {
      keyword: initialKeyword,
      location: initialLocation,
      employmentType: initialType,
    };

    setFilters(currentFilters);
    fetchJobs(currentFilters);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (filters.keyword) newParams.keyword = filters.keyword;
    if (filters.location) newParams.location = filters.location;
    if (filters.employmentType) newParams.employmentType = filters.employmentType;
    setSearchParams(newParams);
    fetchJobs(filters);
  };

  const handleClearFilters = () => {
    const cleared = { keyword: '', location: '', employmentType: '' };
    setFilters(cleared);
    setSearchParams({});
    fetchJobs(cleared);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const formatNumber = (num) => Number(num).toLocaleString();
    if (min && max) return `₹${formatNumber(min)} - ₹${formatNumber(max)}`;
    if (min) return `From ₹${formatNumber(min)}`;
    return `Up to ₹${formatNumber(max)}`;
  };

  return (
    <div className="jobs-page-wrapper">
      {/* Header Banner */}
      <div className="jobs-header-banner">
        <span className="section-eyebrow">Career Marketplace</span>
        <h1 className="page-title">Explore Active Opportunities</h1>
        <p className="page-description">
          Find verified positions across technology, management, engineering, and remote roles.
        </p>
      </div>

      {/* Modern Floating Search Bar */}
      <div className="jobs-search-card">
        <form onSubmit={handleSearchSubmit} className="jobs-search-form">
          <div className="search-field-wrapper">
            <IconSearch className="field-icon" size={18} />
            <input
              id="keyword"
              name="keyword"
              type="text"
              aria-label="Search by job title or keyword"
              placeholder="Job title, skill, or keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
            />
          </div>

          <div className="search-divider"></div>

          <div className="search-field-wrapper">
            <IconMapPin className="field-icon" size={18} />
            <input
              id="location"
              name="location"
              type="text"
              aria-label="Filter by location"
              placeholder="City or Remote"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="search-divider"></div>

          <div className="search-field-wrapper select-field">
            <IconBriefcase className="field-icon" size={18} />
            <select
              id="employmentType"
              name="employmentType"
              aria-label="Filter by employment type"
              value={filters.employmentType}
              onChange={handleFilterChange}
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div className="search-actions">
            <button type="submit" className="btn btn-primary">
              Filter Results
            </button>
            {(filters.keyword || filters.location || filters.employmentType) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-outline"
                title="Reset all filters"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="jobs-results-meta">
        <div className="count-indicator">
          <strong>{jobs.length}</strong> {jobs.length === 1 ? 'position' : 'positions'} available
        </div>
      </div>

      {/* State Handlers */}
      {loading && <LoadingSkeleton count={4} type="card" />}

      {error && (
        <div className="error-state-card">
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button onClick={() => fetchJobs(filters)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Retry Loading
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="empty-state-card">
          <IconBriefcase size={40} className="empty-icon" />
          <h3>No matching vacancies found</h3>
          <p>We couldn't find any positions matching your selected filters. Try broadening your criteria.</p>
          {(filters.keyword || filters.location || filters.employmentType) && (
            <button onClick={handleClearFilters} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Job Cards Grid */}
      {!loading && !error && jobs.length > 0 && (
        <div className="jobs-grid-container">
          {jobs.map((job) => {
            const salaryText = formatSalary(job.salary_min, job.salary_max);
            return (
              <article key={job.id} className="modern-job-card">
                <div className="job-card-main">
                  <div className="job-card-header">
                    <div className="company-info-block">
                      <span className="company-brand">
                        <IconBuilding size={15} /> {job.company_name}
                      </span>
                      <h2 className="job-title-heading">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h2>
                    </div>
                    <span className="badge badge-pill badge-type">
                      {job.employment_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="job-tags-row">
                    <span className="meta-tag">
                      <IconMapPin size={14} /> {job.location}
                    </span>
                    <span className="meta-tag">🎯 {job.experience_level}</span>
                    {salaryText && (
                      <span className="meta-tag salary-tag">
                        💰 {salaryText}
                      </span>
                    )}
                  </div>

                  <p className="job-excerpt">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </p>
                </div>

                <div className="job-card-actions">
                  <span className="date-indicator">
                    <IconClock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
                    View Details <IconArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
