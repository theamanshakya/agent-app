const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get current user profile
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user
    }
  });
}));

module.exports = router; 