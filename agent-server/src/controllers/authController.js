const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Subscription, sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    where: { email },
    include: [{
      model: Subscription,
      as: 'subscription'
    }]
  });
  
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already registered'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with subscription in a transaction
  const result = await sequelize.transaction(async (t) => {
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    }, { transaction: t });

    // Create free subscription
    const subscription = await Subscription.create({
      userId: user.id,
      type: 'free',
      maxAgents: 1,
      chatSecondsLimit: 300,
      secondsUsed: 0
    }, { transaction: t });

    return { user, subscription };
  });

  // Generate token
  const token = generateToken(result.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        subscription: {
          type: result.subscription.type,
          maxAgents: result.subscription.maxAgents,
          chatSecondsLimit: result.subscription.chatSecondsLimit,
          secondsUsed: result.subscription.secondsUsed
        }
      },
      token
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists with subscription
  const user = await User.findOne({
    where: { email },
    include: [{
      model: Subscription,
      as: 'subscription'
    }]
  });

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // If user doesn't have a subscription, create a free one
  let subscription = user.subscription;
  if (!subscription) {
    subscription = await Subscription.create({
      userId: user.id,
      type: 'free',
      maxAgents: 1,
      chatSecondsLimit: 300,
      secondsUsed: 0
    });
  }

  // Generate token
  const token = generateToken(user.id);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: {
          type: subscription.type,
          maxAgents: subscription.maxAgents,
          chatSecondsLimit: subscription.chatSecondsLimit,
          secondsUsed: subscription.secondsUsed
        }
      },
      token
    }
  });
}); 