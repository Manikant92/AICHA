const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all audit logs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM audit_logs ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get audit logs for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching user audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get audit logs for a specific resource
router.get('/resource/:resource', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM audit_logs WHERE resource = $1 ORDER BY created_at DESC',
            [req.params.resource]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching resource audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 