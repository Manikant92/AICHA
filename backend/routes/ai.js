const express = require('express');
const router = express.Router();
const { checkPermission } = require('../config/permit');
const { analyzeMedicalRecord, suggestTreatment } = require('../config/gemini');

// Analyze medical record
router.post('/analyze', async (req, res) => {
  const { record } = req.body;

  try {
    const analysis = await analyzeMedicalRecord(record);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze medical record' });
  }
});

// Suggest treatment
router.post('/suggest-treatment', async (req, res) => {
  const { diagnosis } = req.body;

  try {
    const treatment = await suggestTreatment(diagnosis);
    res.json({ treatment });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to suggest treatment' });
  }
});

// Approve AI suggestion
router.post('/approve', async (req, res) => {
  const { suggestionId, action } = req.body;

  try {
    // In a real application, you would update the suggestion status in the database
    res.json({ message: 'Suggestion approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve suggestion' });
  }
});

module.exports = router; 