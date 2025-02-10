const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');

const router = express.Router();

router.use(protect);

router.route('/agents')
  .get(getAgents)
  .post(createAgent);

router.route('/agents/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(deleteAgent);

module.exports = router; 