const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('free', 'premium'),
    defaultValue: 'free',
    allowNull: false
  },
  maxAgents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Free tier: 1 agent
  },
  chatSecondsLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 300 // Free tier: 300 seconds (5 minutes)
  },
  secondsUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Subscription; 