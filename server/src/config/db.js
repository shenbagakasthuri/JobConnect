import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

const envConfig = dotenv.config({ path: envPath });
const parsed = envConfig.parsed || {};

const dbHost = parsed.DB_HOST || process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(parsed.DB_PORT || process.env.DB_PORT) || 3306;
const dbUser = parsed.DB_USER || process.env.DB_USER || 'jobconnect';
const dbPassword = parsed.DB_PASSWORD !== undefined ? parsed.DB_PASSWORD : (process.env.DB_PASSWORD || '');
const dbName = parsed.DB_NAME || process.env.DB_NAME || 'jobconnect_db';

/**
 * MySQL Connection Pool Configuration
 * Utilizes connection pooling for efficient resource utilization
 * and parameterized query execution to safeguard against SQL injection.
 */
const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(parsed.DB_CONNECTION_LIMIT || process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Helper to verify database connectivity.
 */
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'Database connection established successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default pool;
