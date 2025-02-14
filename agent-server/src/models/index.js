const sequelize = require('../config/database');
const User = require('./User');
const Agent = require('./Agent');
const Subscription = require('./Subscription');

// Define model associations
User.hasMany(Agent, {
  foreignKey: 'createdBy',
  as: 'agents'
});
Agent.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasOne(Subscription, {
  foreignKey: 'userId',
  as: 'subscription'
});
Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

const models = {
  User,
  Agent,
  Subscription,
  sequelize
};

module.exports = models; 