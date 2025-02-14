const { Agent, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get total agents count
  const totalAgents = await Agent.count({
    where: { createdBy: userId }
  });

  // Get agents by type
  const agentsByType = await Agent.findAll({
    where: { createdBy: userId },
    attributes: [
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['type']
  });

  // Get active agents count
  const activeAgents = await Agent.count({
    where: { 
      createdBy: userId,
      status: 'active'
    }
  });

  // Get recent agents
  const recentAgents = await Agent.findAll({
    where: { createdBy: userId },
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  // Get daily agent creation stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyStats = await Agent.findAll({
    where: {
      createdBy: userId,
      createdAt: {
        [Op.gte]: thirtyDaysAgo
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });

  // Format the response
  const formattedDailyStats = dailyStats.map(stat => ({
    date: stat.get('date'),
    count: parseInt(stat.get('count'), 10)
  }));

  const formattedAgentsByType = agentsByType.map(type => ({
    type: type.get('type'),
    count: parseInt(type.get('count'), 10)
  }));

  res.json({
    status: 'success',
    data: {
      totalAgents,
      activeAgents,
      agentsByType: formattedAgentsByType,
      recentAgents,
      dailyStats: formattedDailyStats
    }
  });
}); 