const jwt = require('jsonwebtoken');
const { User, Subscription } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findOne({
      where: { id: decoded.id },
      include: [{
        model: Subscription,
        as: 'subscription'
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // If user somehow doesn't have a subscription, create a free one
    if (!user.subscription) {
      user.subscription = await Subscription.create({
        userId: user.id,
        type: 'free',
        maxAgents: 1,
        chatMinutesLimit: 5,
        minutesUsed: 0
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated'
    });
  }
}); 