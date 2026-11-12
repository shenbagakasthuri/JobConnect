import { Router } from 'express';
import pool, { testConnection } from '../config/db.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check server and database connectivity health
 * @access  Public
 */
router.get('/health', async (req, res, next) => {
  try {
    const dbStatus = await testConnection();
    
    // Check tables count
    let tableCount = 0;
    if (dbStatus.success) {
      const [rows] = await pool.query(
        "SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = DATABASE()"
      );
      tableCount = rows[0]?.total_tables || 0;
    }

    const isHealthy = dbStatus.success;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'JobConnect API',
      database: {
        connected: dbStatus.success,
        message: dbStatus.message,
        tableCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
