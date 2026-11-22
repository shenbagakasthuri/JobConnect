import pool from '../config/db.js';

/**
 * Job Model - Parameterized MySQL Queries for jobs table
 */
export const JobModel = {
  /**
   * Fetch all active jobs with optional filters (keyword, location, employment_type)
   */
  async findAll({ keyword, location, employmentType }) {
    let query = `
      SELECT 
        j.id,
        j.company_id,
        j.employer_id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.location,
        j.employment_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.application_deadline,
        j.status,
        j.created_at,
        j.updated_at,
        c.company_name,
        c.website AS company_website,
        c.location AS company_location,
        c.industry AS company_industry,
        c.logo_path AS company_logo
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.status = 'ACTIVE'
    `;
    const params = [];

    if (keyword && keyword.trim() !== '') {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR c.company_name LIKE ?)`;
      const kwPattern = `%${keyword.trim()}%`;
      params.push(kwPattern, kwPattern, kwPattern);
    }

    if (location && location.trim() !== '') {
      query += ` AND j.location LIKE ?`;
      params.push(`%${location.trim()}%`);
    }

    if (employmentType && employmentType.trim() !== '') {
      query += ` AND j.employment_type = ?`;
      params.push(employmentType.trim());
    }

    query += ` ORDER BY j.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Fetch a single job by id with complete company details
   */
  async findById(id) {
    const query = `
      SELECT 
        j.id,
        j.company_id,
        j.employer_id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.location,
        j.employment_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.application_deadline,
        j.status,
        j.created_at,
        j.updated_at,
        c.company_name,
        c.description AS company_description,
        c.website AS company_website,
        c.location AS company_location,
        c.industry AS company_industry,
        c.logo_path AS company_logo
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Fetch all jobs created by a specific employer
   */
  async findByEmployerId(employerId) {
    const query = `
      SELECT 
        j.id,
        j.company_id,
        j.employer_id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.location,
        j.employment_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.application_deadline,
        j.status,
        j.created_at,
        j.updated_at,
        c.company_name
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.employer_id = ?
      ORDER BY j.created_at DESC
    `;
    const [rows] = await pool.query(query, [employerId]);
    return rows;
  },

  /**
   * Create a new job posting
   */
  async create({
    companyId,
    employerId,
    title,
    description,
    requirements = null,
    responsibilities = null,
    location,
    employmentType = 'FULL_TIME',
    experienceLevel = 'ENTRY',
    salaryMin = null,
    salaryMax = null,
    applicationDeadline = null,
    status = 'ACTIVE',
  }) {
    const [result] = await pool.query(
      `INSERT INTO jobs (
        company_id, employer_id, title, description, requirements, responsibilities,
        location, employment_type, experience_level, salary_min, salary_max,
        application_deadline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        employerId,
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
        status,
      ]
    );

    return result.insertId;
  },

  /**
   * Delete a job posting ensuring employer ownership
   */
  async deleteByIdAndEmployer(jobId, employerId) {
    const [result] = await pool.query(
      `DELETE FROM jobs WHERE id = ? AND employer_id = ?`,
      [jobId, employerId]
    );
    return result.affectedRows > 0;
  },
};

export default JobModel;
