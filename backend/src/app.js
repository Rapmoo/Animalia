const express = require('express');
const cors = require('cors');

const pool = require('./config/database');
const animalRoutes = require('./routes/animalRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/animals', animalRoutes);
app.use('/api/media', mediaRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        message: 'Animalia API is running'
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection failed'
      }
    });
  }
});

module.exports = app;