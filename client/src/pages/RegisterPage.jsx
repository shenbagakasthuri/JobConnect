import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBriefcase, IconEye, IconEyeOff, IconShield, IconUser, IconBuilding } from '../components/Icons';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'JOB_SEEKER',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleRoleSelect = (roleName) => {
    setFormData((prev) => ({ ...prev, role: roleName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        const errorsMap = {};
        err.errors.forEach((e) => {
          errorsMap[e.field] = e.message;
        });
        setFieldErrors(errorsMap);
      }
      setError(err.message || 'Registration failed. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-clean register-card">
        <div className="auth-brand-header">
          <div className="auth-icon-badge">
            <IconBriefcase size={24} />
          </div>
          <h1 className="auth-title">Create your JobConnect Account</h1>
          <p className="auth-subtitle">Join as a Job Seeker to discover roles or as an Employer to hire</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="role-selector-container">
          <button
            type="button"
            className={`role-option-btn ${formData.role === 'JOB_SEEKER' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('JOB_SEEKER')}
          >
            <IconUser size={18} />
            <div className="role-btn-text">
              <strong>Job Seeker</strong>
              <span>Looking for jobs</span>
            </div>
          </button>

          <button
            type="button"
            className={`role-option-btn ${formData.role === 'EMPLOYER' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('EMPLOYER')}
          >
            <IconBuilding size={18} />
            <div className="role-btn-text">
              <strong>Employer</strong>
              <span>Hiring talent</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-clean">
          <div className="form-field-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={formData.fullName}
              onChange={handleChange}
            />
            {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
          </div>

          <div className="form-field-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-row-two">
            <div className="form-field-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Min 8 chars"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
            </div>

            <div className="form-field-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {fieldErrors.confirmPassword && (
                <span className="field-error-text">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating Profile...' : `Register as ${formData.role === 'JOB_SEEKER' ? 'Job Seeker' : 'Employer'}`}
          </button>
        </form>

        <div className="auth-footer-clean">
          <span>Already have an account?</span>{' '}
          <Link to="/login" className="auth-switch-link">
            Sign In
          </Link>
        </div>

        <div className="auth-security-note">
          <IconShield size={14} />
          <span>Strict role-based access control with secure bcrypt hashing</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
