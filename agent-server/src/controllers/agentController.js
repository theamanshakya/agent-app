const { Agent } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.createAgent = asyncHandler(async (req, res) => {
  const { name, type, description, personality, ttsProvider, ttsVoice, status } = req.body;
  
  const agent = await Agent.create({
    name,
    type,
    description,
    personality,
    ttsProvider,
    ttsVoice,
    status,
    createdBy: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { agent }
  });
});

exports.getAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.findAll({
    where: { createdBy: req.user.id }
  });

  res.json({
    status: 'success',
    data: { agents }
  });
});

exports.getAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({
    where: {
      id: req.params.id,
      createdBy: req.user.id
    }
  });

  if (!agent) {
    return res.status(404).json({
      status: 'error',
      message: 'Agent not found'
    });
  }

  res.json({
    status: 'success',
    data: { agent }
  });
});

exports.updateAgent = asyncHandler(async (req, res) => {
  const { name, type, description, personality, ttsProvider, ttsVoice, status } = req.body;
  
  const agent = await Agent.findOne({
    where: {
      id: req.params.id,
      createdBy: req.user.id
    }
  });

  if (!agent) {
    return res.status(404).json({
      status: 'error',
      message: 'Agent not found'
    });
  }

  await agent.update({
    name,
    type,
    description,
    personality,
    ttsProvider,
    ttsVoice,
    status
  });

  res.json({
    status: 'success',
    data: { agent }
  });
});

exports.deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({
    where: {
      id: req.params.id,
      createdBy: req.user.id
    }
  });

  if (!agent) {
    return res.status(404).json({
      status: 'error',
      message: 'Agent not found'
    });
  }

  await agent.destroy();

  res.json({
    status: 'success',
    message: 'Agent deleted successfully'
  });
}); 