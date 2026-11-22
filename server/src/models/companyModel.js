import pool from '../config/db.js';

/**
 * Company Model - Database queries for companies table
 */
export const CompanyModel = {
  /**
   * Find company by employer user id
   */
  async findByEmployerId(employerId) {
    const [rows] = await pool.query(
      `SELECT id, employer_id, company_name, description, website, location, industry, logo_path, created_at, updated_at
       FROM companies
       WHERE employer_id = ?
       LIMIT 1`,
      [employerId]
    );
    return rows[0] || null;
  },

  /**
   * Find company by id
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, employer_id, company_name, description, website, location, industry, logo_path, created_at, updated_at
       FROM companies
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create or update employer's company profile
   */
  async create({ employerId, companyName, description = null, website = null, location = null, industry = null }) {
    const [result] = await pool.query(
      `INSERT INTO companies (employer_id, company_name, description, website, location, industry)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employerId, companyName, description, website, location, industry]
    );

    return {
      id: result.insertId,
      employer_id: employerId,
      company_name: companyName,
      description,
      website,
      location,
      industry,
    };
  },
};

export default CompanyModel;
