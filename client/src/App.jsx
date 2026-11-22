import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import PostJobPage from './pages/PostJobPage';
import MyJobsPage from './pages/MyJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobApplicantsPage from './pages/JobApplicantsPage';

import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Job Seeker Protected Routes */}
              <Route
                path="/my-applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'ADMIN']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Employer-Only Protected Routes */}
              <Route
                path="/employer/post-job"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employer/my-jobs"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                    <MyJobsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employer/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                    <JobApplicantsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
