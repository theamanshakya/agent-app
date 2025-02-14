const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { User, Subscription } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get current user profile
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
    include: [{
      model: Subscription,
      as: 'subscription'
    }],
    attributes: { exclude: ['password'] }
  });

  if (!user.subscription) {
    user.subscription = await Subscription.create({
      userId: user.id,
      type: 'free',
      maxAgents: 1,
      chatSecondsLimit: 300,
      secondsUsed: 0
    });
  }

  res.json({
    status: 'success',
    data: {
      user: {
        ...user.toJSON(),
        subscription: {
          type: user.subscription.type,
          maxAgents: user.subscription.maxAgents,
          chatSecondsLimit: user.subscription.chatSecondsLimit,
          secondsUsed: user.subscription.secondsUsed
        }
      }
    }
  });
}));

// Update user profile
router.put('/me', protect, asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // If updating password
  if (currentPassword && newPassword) {
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
  }

  // Update other fields
  if (name) user.name = name;
  if (email) {
    // Check if email is already taken
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    user.email = email;
  }

  await user.save();

  // Return updated user without password
  const { password, ...userWithoutPassword } = user.toJSON();

  res.json({
    status: 'success',
    data: {
      user: userWithoutPassword
    }
  });
}));

module.exports = router; 