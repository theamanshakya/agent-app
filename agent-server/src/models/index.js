const sequelize = require('../config/database');
const User = require('./User');
const Agent = require('./Agent');

// Define model associations here
// Example: User.hasMany(Posts)

const models = {
  User,
  Agent,
  sequelize
};

module.exports = models; 