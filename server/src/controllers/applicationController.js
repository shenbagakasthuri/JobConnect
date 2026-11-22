import fs from 'fs';
import path from 'path';
import ApplicationModel from '../models/applicationModel.js';
import JobModel from '../models/jobModel.js';
import { UPLOAD_DIR } from '../middleware/uploadMiddleware.js';

/**
 * Controller: Apply for a Job (Seeker Only)
 * POST /api/applications/:jobId
 */
export const applyForJob = async (req, res, next) => {
  let uploadedFilePath = null;
  if (req.file) {
    uploadedFilePath = req.file.path;
  }

  try {
    const applicantId = req.user.id;
    const jobId = Number(req.params.jobId);

    if (isNaN(jobId)) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID parameter.',
      });
    }

    // 1. Verify Job exists and is ACTIVE
    const job = await JobModel.findById(jobId);
    if (!job) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.status !== 'ACTIVE') {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer accepting applications.',
      });
    }

    // 2. Check application deadline if one exists
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: 'The deadline for this job posting has passed.',
        });
      }
    }

    // 3. Prevent duplicate applications check
    const existingApplication = await ApplicationModel.findByJobAndApplicant(jobId, applicantId);
    if (existingApplication) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    // 4. Save relative resume path
    const relativeResumePath = req.file ? path.basename(req.file.path) : null;
    const coverLetter = req.body.coverLetter ? req.body.coverLetter.trim() : null;

    // 5. Insert application record
    const applicationId = await ApplicationModel.create({
      jobId,
      applicantId,
      resumePath: relativeResumePath,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: {
        applicationId,
        jobId,
        status: 'PENDING',
      },
    });
  } catch (error) {
    // If DB fails, remove uploaded file to avoid orphaned files on disk
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupErr) {
        console.error('File cleanup error:', cleanupErr);
      }
    }

    // Gracefully handle duplicate key error if race condition occurs
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    next(error);
  }
};

/**
 * Controller: Get applications for logged-in seeker
 * GET /api/applications/my-applications
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applicantId = req.user.id;
    const applications = await ApplicationModel.findByApplicantId(applicantId);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get applicants for a specific employer's job
 * GET /api/applications/employer/job/:jobId
 */
export const getJobApplicants = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobId = Number(req.params.jobId);

    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID parameter.',
      });
    }

    // Verify job belongs to this employer
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.employer_id !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view applicants for this job.',
      });
    }

    const applicants = await ApplicationModel.findByJobIdForEmployer(jobId, employerId);

    res.status(200).json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        companyName: job.company_name,
      },
      count: applicants.length,
      data: applicants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update application status (Employer Only)
 * PATCH /api/applications/:applicationId/status
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = Number(req.params.applicationId);
    const { status } = req.body;

    const allowedStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID parameter.',
      });
    }

    // Verify application exists and employer owns the job
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.employer_id !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to manage this applicant.',
      });
    }

    await ApplicationModel.updateStatus(applicationId, status);

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: {
        applicationId,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Secure resume download
 * GET /api/applications/:applicationId/resume
 * Access: Applicant themselves OR Employer who posted the job OR Admin
 */
export const downloadResume = async (req, res, next) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID parameter.',
      });
    }

    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (!application.resume_path) {
      return res.status(404).json({
        success: false,
        message: 'No resume attached to this application.',
      });
    }

    // Authorization check: Only applicant, employer of this job, or Admin
    const isApplicant = application.applicant_id === userId;
    const isEmployer = application.employer_id === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isApplicant && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to download this resume.',
      });
    }

    const safeFilename = path.basename(application.resume_path);
    const fullPath = path.join(UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file could not be found on server storage.',
      });
    }

    res.download(fullPath, `Resume_${application.id}_${safeFilename}`);
  } catch (error) {
    next(error);
  }
};
