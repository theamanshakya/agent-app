const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { checkChatLimit } = require('../middleware/subscriptionMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect);

// Start chat session
router.post('/start/:agentId', checkChatLimit, async (req, res) => {
  res.json({
    status: 'success',
    message: 'Chat session started'
  });
});

// End chat session and update seconds used
router.post('/end', asyncHandler(async (req, res) => {
  const { seconds } = req.body;
  
  if (!seconds || seconds <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid seconds value'
    });
  }

  const subscription = await req.user.getSubscription();
  subscription.secondsUsed += seconds;
  await subscription.save();

  res.json({
    status: 'success',
    data: {
      subscription: {
        type: subscription.type,
        maxAgents: subscription.maxAgents,
        chatSecondsLimit: subscription.chatSecondsLimit,
        secondsUsed: subscription.secondsUsed
      }
    }
  });
}));

module.exports = router; 