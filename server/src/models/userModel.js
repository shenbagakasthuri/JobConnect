import pool from '../config/db.js';

/**
 * User Model - Parameterized MySQL Queries
 */
export const UserModel = {
  /**
   * Find a user by their unique email
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, password_hash, role, account_status, created_at, updated_at 
       FROM users 
       WHERE email = ? 
       LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by their primary key ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, account_status, created_at, updated_at 
       FROM users 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user record within a transaction
   * Automatically initializes the corresponding profile if role is JOB_SEEKER
   */
  async create({ fullName, email, passwordHash, role }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role, account_status)
         VALUES (?, ?, ?, ?, 'ACTIVE')`,
        [fullName, email, passwordHash, role]
      );

      const userId = userResult.insertId;

      // Auto-create blank profile for Job Seekers
      if (role === 'JOB_SEEKER') {
        await connection.query(
          `INSERT INTO job_seeker_profiles (user_id) VALUES (?)`,
          [userId]
        );
      }

      await connection.commit();

      return {
        id: userId,
        full_name: fullName,
        email,
        role,
        account_status: 'ACTIVE',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

export default UserModel;
