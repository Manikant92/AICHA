import express from 'express';
import fetch from 'node-fetch';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required but not set.');
}

const analysisSchema = z.object({
  analysis: z.string().min(1, 'Analysis is required')
});

// @ts-ignore
router.post('/analyze', authenticateToken, async (req, res, next) => {
  try {
    const { analysis } = analysisSchema.parse(req.body);

    const prompt = `As a medical AI assistant, please analyze the following medical observation and provide a detailed, professional suggestion. Include potential diagnoses, recommended tests, and treatment considerations. Be thorough but concise.\n\nMedical Observation:\n${analysis}\n\nPlease structure your response in the following format:\n1. Initial Assessment\n2. Potential Diagnoses\n3. Recommended Tests\n4. Treatment Considerations\n5. Follow-up Recommendations`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch {}
      return res.status(500).json({ message: errorData.error?.message || 'Failed to generate AI analysis' });
    }

    let data: any = {};
    try { data = await response.json(); } catch {}
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion returned.';
    res.json({ suggestion });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
});

export default router; 