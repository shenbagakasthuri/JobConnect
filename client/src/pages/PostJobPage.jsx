import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { IconBriefcase, IconBuilding, IconMapPin, IconCurrency, IconCheckCircle } from '../components/Icons';

export const PostJobPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: '',
    salaryMax: '',
    applicationDeadline: '',
    description: '',
    requirements: '',
    responsibilities: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title.trim()) {
      setError('Job title is required.');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Job location is required.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Job description is required.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        applicationDeadline: formData.applicationDeadline || null,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        responsibilities: formData.responsibilities.trim() || null,
        companyName: formData.companyName.trim() || undefined,
      };

      const res = await api.createJob(payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/employer/my-jobs');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page-wrapper">
      <div className="form-page-header">
        <Link to="/employer/my-jobs" className="back-link">
          ← Back to My Postings
        </Link>
        <h1 className="page-title">Publish a New Vacancy</h1>
        <p className="page-description">
          Fill out role parameters and requirements to reach qualified job seekers on JobConnect
        </p>
      </div>

      <div className="modern-form-card">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert" style={{ background: '#ecfdf5', color: '#065f46' }}>
            <IconCheckCircle size={18} /> Job vacancy published successfully! Redirecting to your active listings...
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-stacked-form">
          {/* Section 1: Basic Position Details */}
          <fieldset className="form-section-group">
            <legend className="section-legend">
              <IconBriefcase size={18} /> Position Basics
            </legend>

            <div className="form-grid-two">
              <div className="form-field-group">
                <label htmlFor="title">
                  Job Title <span className="req-star">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="companyName">Company / Organization Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="e.g. Acme Technologies (defaults to your profile name)"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-three">
              <div className="form-field-group">
                <label htmlFor="location">
                  Location <span className="req-star">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder="e.g. Bangalore, India / Remote"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="employmentType">Employment Type</label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div className="form-field-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior Level</option>
                  <option value="LEAD">Lead / Manager</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Section 2: Compensation & Timeline */}
          <fieldset className="form-section-group">
            <legend className="section-legend">
              <IconCurrency size={18} /> Compensation & Timeline
            </legend>

            <div className="form-grid-three">
              <div className="form-field-group">
                <label htmlFor="salaryMin">Minimum Salary (₹ / Year)</label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  placeholder="e.g. 800000"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="salaryMax">Maximum Salary (₹ / Year)</label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  placeholder="e.g. 1500000"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="applicationDeadline">Application Deadline</label>
                <input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>

          {/* Section 3: In-Depth Description */}
          <fieldset className="form-section-group">
            <legend className="section-legend">
              <IconBuilding size={18} /> Detailed Role Descriptions
            </legend>

            <div className="form-field-group">
              <label htmlFor="description">
                Role Description <span className="req-star">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                placeholder="Describe team mission, daily objectives, and the technical scope of the role..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-field-group">
              <label htmlFor="responsibilities">Key Responsibilities</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                rows="3"
                placeholder="Bullet points describing core milestones, code ownership, or design deliverables..."
                value={formData.responsibilities}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-field-group">
              <label htmlFor="requirements">Requirements & Qualifications</label>
              <textarea
                id="requirements"
                name="requirements"
                rows="3"
                placeholder="Required tech stack, frameworks, degree requirements, or years of practical experience..."
                value={formData.requirements}
                onChange={handleChange}
              ></textarea>
            </div>
          </fieldset>

          <div className="form-action-bar">
            <button
              type="button"
              onClick={() => navigate('/employer/my-jobs')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
