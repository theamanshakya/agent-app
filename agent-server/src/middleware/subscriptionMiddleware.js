const asyncHandler = require('../utils/asyncHandler');

exports.checkAgentLimit = asyncHandler(async (req, res, next) => {
  const canCreateAgent = await req.user.checkAgentLimit();
  
  if (!canCreateAgent) {
    return res.status(403).json({
      status: 'error',
      message: 'You have reached your agent limit. Please upgrade your subscription to create more agents.'
    });
  }
  
  next();
});

exports.checkChatLimit = asyncHandler(async (req, res, next) => {
  const subscription = await req.user.getSubscription();
  const canChat = subscription.secondsUsed < subscription.chatSecondsLimit;
  
  if (!canChat) {
    return res.status(403).json({
      status: 'error',
      message: 'You have reached your chat time limit. Please upgrade your subscription to continue chatting.'
    });
  }
  
  next();
}); 