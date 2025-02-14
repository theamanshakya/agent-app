const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const agentRoutes = require('./agent');
const chatRoutes = require('./chat');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Agent routes
router.use('/', agentRoutes);  // Since we already defined /agents in agent.js

// Chat routes
router.use('/chat', chatRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

module.exports = router; 