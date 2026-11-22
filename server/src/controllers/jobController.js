import JobModel from '../models/jobModel.js';
import CompanyModel from '../models/companyModel.js';
import UserModel from '../models/userModel.js';

/**
 * Controller: Get all jobs (Public with search & filtering)
 * GET /api/jobs
 */
export const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, employmentType } = req.query;

    const jobs = await JobModel.findAll({
      keyword,
      location,
      employmentType,
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single job by ID (Public)
 * GET /api/jobs/:id
 */
export const getJobById = async (req, res, next) => {
  try {
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID parameter.',
      });
    }

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create a new job posting (Employer only)
 * POST /api/jobs
 */
export const createJob = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      applicationDeadline,
      companyName,
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required.',
      });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required.',
      });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job location is required.',
      });
    }

    // Check if the employer already has a registered company
    let company = await CompanyModel.findByEmployerId(employerId);

    if (!company) {
      // Determine company name: use provided companyName or fall back to employer user full_name
      let nameToUse = companyName ? companyName.trim() : null;
      if (!nameToUse) {
        const user = await UserModel.findById(employerId);
        nameToUse = user ? `${user.full_name}'s Company` : 'Hiring Company';
      }

      company = await CompanyModel.create({
        employerId,
        companyName: nameToUse,
        location: location.trim(),
      });
    }

    // Insert job record
    const newJobId = await JobModel.create({
      companyId: company.id,
      employerId,
      title: title.trim(),
      description: description.trim(),
      requirements: requirements ? requirements.trim() : null,
      responsibilities: responsibilities ? responsibilities.trim() : null,
      location: location.trim(),
      employmentType: employmentType || 'FULL_TIME',
      experienceLevel: experienceLevel || 'ENTRY',
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      applicationDeadline: applicationDeadline || null,
      status: 'ACTIVE',
    });

    const createdJob = await JobModel.findById(newJobId);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully.',
      data: createdJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get jobs posted by authenticated employer
 * GET /api/jobs/employer/my-jobs
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobs = await JobModel.findByEmployerId(employerId);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete job posting owned by authenticated employer
 * DELETE /api/jobs/:id
 */
export const deleteJob = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobId = Number(req.params.id);

    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID parameter.',
      });
    }

    // Check if job exists at all
    const existingJob = await JobModel.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // Verify ownership
    if (existingJob.employer_id !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this job posting.',
      });
    }

    const deleted = await JobModel.deleteByIdAndEmployer(jobId, employerId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
