import React from 'react';
import { Link } from 'react-router-dom';
import { IconBriefcase, IconShield } from '../components/Icons';

export const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand">
              <div className="footer-icon-box">
                <IconBriefcase size={20} />
              </div>
              <span className="footer-title">JobConnect</span>
            </Link>
            <p className="footer-tagline">
              Connecting exceptional talent with opportunities. Built as an advanced full-stack
              internship project with React, Node.js, and MySQL.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><Link to="/login">Sign In</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Recruiters</h4>
              <ul>
                <li><Link to="/employer/post-job">Post a Job</Link></li>
                <li><Link to="/employer/my-jobs">Manage Postings</Link></li>
                <li><Link to="/dashboard">Employer Hub</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Security & Architecture</h4>
              <ul>
                <li><span>MySQL 8.0 Engine</span></li>
                <li><span>HttpOnly Cookie JWT</span></li>
                <li><span>Role-Based Access Control</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} JobConnect — Auspify Technologies Internship. All rights reserved.</p>
          <div className="footer-security-pill">
            <IconShield size={14} />
            <span>Secure Architecture Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
