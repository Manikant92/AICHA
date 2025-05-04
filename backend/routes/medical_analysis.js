const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all medical analyses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM medical_analysis ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching medical analyses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single medical analysis
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM medical_analysis WHERE id = $1',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Medical analysis not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching medical analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new medical analysis
router.post('/', authenticateToken, async (req, res) => {
    const { patient_id, analysis } = req.body;

    try {
        const { rows } = await pool.query(
            `INSERT INTO medical_analysis (patient_id, analysis, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [patient_id, analysis, req.user.id]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating medical analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a medical analysis
router.put('/:id', authenticateToken, async (req, res) => {
    const { analysis, status } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE medical_analysis
             SET analysis = $1, status = $2, approved_by = $3
             WHERE id = $4
             RETURNING *`,
            [analysis, status, req.user.id, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Medical analysis not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating medical analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a medical analysis
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'DELETE FROM medical_analysis WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Medical analysis not found' });
        }

        res.json({ message: 'Medical analysis deleted successfully' });
    } catch (error) {
        console.error('Error deleting medical analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 