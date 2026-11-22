import pool from '../config/db.js';

/**
 * Application Model - Parameterized MySQL operations for applications table
 */
export const ApplicationModel = {
  /**
   * Submit a new job application
   */
  async create({ jobId, applicantId, resumePath = null, coverLetter = null }) {
    const [result] = await pool.query(
      `INSERT INTO applications (job_id, applicant_id, resume_path, cover_letter, application_status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [jobId, applicantId, resumePath, coverLetter]
    );
    return result.insertId;
  },

  /**
   * Check if user has already applied for this job
   */
  async findByJobAndApplicant(jobId, applicantId) {
    const [rows] = await pool.query(
      `SELECT id, job_id, applicant_id, application_status, applied_at
       FROM applications
       WHERE job_id = ? AND applicant_id = ?
       LIMIT 1`,
      [jobId, applicantId]
    );
    return rows[0] || null;
  },

  /**
   * Find application by id with complete ownership details
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.job_id,
        a.applicant_id,
        a.resume_path,
        a.cover_letter,
        a.application_status,
        a.applied_at,
        a.updated_at,
        j.employer_id,
        j.title AS job_title
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get all applications for a specific job seeker
   */
  async findByApplicantId(applicantId) {
    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.job_id,
        a.application_status,
        a.applied_at,
        a.updated_at,
        (a.resume_path IS NOT NULL AND a.resume_path != '') AS has_resume,
        j.title AS job_title,
        j.location AS job_location,
        j.employment_type,
        c.company_name
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       INNER JOIN companies c ON j.company_id = c.id
       WHERE a.applicant_id = ?
       ORDER BY a.applied_at DESC`,
      [applicantId]
    );
    return rows;
  },

  /**
   * Get all applicants for an employer's job
   */
  async findByJobIdForEmployer(jobId, employerId) {
    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.job_id,
        a.applicant_id,
        a.cover_letter,
        a.application_status,
        a.applied_at,
        a.updated_at,
        (a.resume_path IS NOT NULL AND a.resume_path != '') AS has_resume,
        u.full_name AS applicant_name,
        u.email AS applicant_email
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       INNER JOIN users u ON a.applicant_id = u.id
       WHERE a.job_id = ? AND j.employer_id = ?
       ORDER BY a.applied_at DESC`,
      [jobId, employerId]
    );
    return rows;
  },

  /**
   * Update application status
   */
  async updateStatus(applicationId, newStatus) {
    const [result] = await pool.query(
      `UPDATE applications
       SET application_status = ?
       WHERE id = ?`,
      [newStatus, applicationId]
    );
    return result.affectedRows > 0;
  },
};

export default ApplicationModel;
