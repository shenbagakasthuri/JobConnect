import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBriefcase, IconUser, IconPlus } from '../components/Icons';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isSeeker = user?.role === 'JOB_SEEKER';
  const isEmployer = user?.role === 'EMPLOYER';

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <IconBriefcase size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">JobConnect</span>
            <span className="brand-badge">PRO</span>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-primary">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}

            {isSeeker && (
              <NavLink
                to="/my-applications"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Applications
              </NavLink>
            )}

            {isEmployer && (
              <>
                <NavLink
                  to="/employer/post-job"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconPlus size={16} /> Post Job
                </NavLink>
                <NavLink
                  to="/employer/my-jobs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Listings
                </NavLink>
              </>
            )}
          </div>

          <div className="nav-secondary">
            {isAuthenticated ? (
              <div className="user-nav-group">
                <div className="user-profile-pill">
                  <div className="user-avatar">
                    <IconUser size={16} />
                  </div>
                  <div className="user-info-text">
                    <span className="user-display-name">{user?.fullName || 'User'}</span>
                    <span className="user-role-badge">{user?.role?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Log Out
                </button>
              </div>
            ) : (
              <div className="guest-nav-group">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
