const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all treatment plans
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM treatment_plans ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching treatment plans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single treatment plan
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM treatment_plans WHERE id = $1',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Treatment plan not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching treatment plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new treatment plan
router.post('/', authenticateToken, async (req, res) => {
    const { patient_id, diagnosis, treatment } = req.body;

    try {
        const { rows } = await pool.query(
            `INSERT INTO treatment_plans (patient_id, diagnosis, treatment, created_by)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [patient_id, diagnosis, treatment, req.user.id]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating treatment plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a treatment plan
router.put('/:id', authenticateToken, async (req, res) => {
    const { diagnosis, treatment, status } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE treatment_plans
             SET diagnosis = $1, treatment = $2, status = $3, approved_by = $4
             WHERE id = $5
             RETURNING *`,
            [diagnosis, treatment, status, req.user.id, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Treatment plan not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating treatment plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a treatment plan
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'DELETE FROM treatment_plans WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Treatment plan not found' });
        }

        res.json({ message: 'Treatment plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting treatment plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 