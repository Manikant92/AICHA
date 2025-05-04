const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM patients ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single patient
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM patients WHERE id = $1',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new patient
router.post('/', authenticateToken, async (req, res) => {
    const { name, age, symptoms, medical_history, current_medications } = req.body;

    try {
        const { rows } = await pool.query(
            `INSERT INTO patients (name, age, symptoms, medical_history, current_medications, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, age, symptoms, medical_history, current_medications, req.user.id]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a patient
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, age, symptoms, medical_history, current_medications } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE patients
             SET name = $1, age = $2, symptoms = $3, medical_history = $4, current_medications = $5
             WHERE id = $6
             RETURNING *`,
            [name, age, symptoms, medical_history, current_medications, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a patient
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'DELETE FROM patients WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 