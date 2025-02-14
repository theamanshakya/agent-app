const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Instance method to check subscription limits
User.prototype.checkAgentLimit = async function() {
  const subscription = await this.getSubscription();
  const agentCount = await this.countAgents();
  return agentCount < subscription.maxAgents;
};

User.prototype.checkChatLimit = async function() {
  const subscription = await this.getSubscription();
  return subscription.minutesUsed < subscription.chatMinutesLimit;
};

User.prototype.updateChatTime = async function(minutes) {
  const subscription = await this.getSubscription();
  subscription.minutesUsed += minutes;
  await subscription.save();
};

module.exports = User; 