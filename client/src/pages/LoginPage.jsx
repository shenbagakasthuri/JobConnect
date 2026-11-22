import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBriefcase, IconEye, IconEyeOff, IconShield } from '../components/Icons';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-clean">
        <div className="auth-brand-header">
          <div className="auth-icon-badge">
            <IconBriefcase size={24} />
          </div>
          <h1 className="auth-title">Welcome back to JobConnect</h1>
          <p className="auth-subtitle">Sign in with your email and password to access your account</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-clean">
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
          </div>

          <div className="form-field-group">
            <div className="label-with-action">
              <label htmlFor="password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
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
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-clean">
          <span>Don't have an account?</span>{' '}
          <Link to="/register" className="auth-switch-link">
            Create an Account
          </Link>
        </div>

        <div className="auth-security-note">
          <IconShield size={14} />
          <span>Protected with HttpOnly JWT Sessions & bcrypt encryption</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
