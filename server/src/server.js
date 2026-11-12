import app from './app.js';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test DB connection before listening
  const dbHealth = await testConnection();
  if (dbHealth.success) {
    console.log(`[Database] MySQL connected successfully.`);
  } else {
    console.error(`[Database Error] Could not connect to MySQL: ${dbHealth.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`[JobConnect Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[JobConnect Server] Health check available at: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  const handleShutdown = () => {
    console.log('\n[JobConnect Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[JobConnect Server] Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
};

startServer();
