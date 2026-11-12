import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security and utility middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JobConnect API',
    tagline: 'Connecting talent with opportunities.',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', healthRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
