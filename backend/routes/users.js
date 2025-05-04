const express = require('express');
const router = express.Router();

const { pool } = require('../config/database');

// Get all users (open access)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users ORDER BY username');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;