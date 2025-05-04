const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required but not set.');
}

const getMedicalAnalysisPrompt = (record) => {
    return `As a medical AI assistant, please analyze the following medical record and provide a structured analysis including:
1. Key Symptoms Analysis
2. Potential Risk Factors
3. Recommended Tests or Examinations
4. Preliminary Observations
5. Areas Requiring Further Investigation

Medical Record:
${record}

Please provide a detailed, professional analysis while maintaining patient confidentiality.`;
};

const getTreatmentSuggestionPrompt = (symptoms) => {
    return `As a medical AI assistant, please analyze these symptoms and provide a structured treatment suggestion including:
1. Potential Diagnoses
2. Recommended Treatment Options
3. Lifestyle Modifications
4. Warning Signs to Monitor
5. Follow-up Recommendations

Symptoms:
${symptoms}

Please provide evidence-based treatment suggestions while noting that final medical decisions should be made by qualified healthcare professionals.`;
};

const analyzeMedicalRecord = async (record) => {
    try {
        const prompt = getMedicalAnalysisPrompt(record);
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
            let errorData = {};
            try { errorData = await response.json(); } catch {}
            throw new Error(errorData.error?.message || 'Failed to generate AI analysis');
        }
        let data = {};
        try { data = await response.json(); } catch {}
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion returned.';
    } catch (error) {
        console.error('Error analyzing medical record:', error?.message || error);
        throw new Error(error?.message || 'Unknown error from Gemini');
    }
};

const suggestTreatment = async (symptoms) => {
    try {
        const prompt = getTreatmentSuggestionPrompt(symptoms);
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
            let errorData = {};
            try { errorData = await response.json(); } catch {}
            throw new Error(errorData.error?.message || 'Failed to generate treatment suggestion');
        }
        let data = {};
        try { data = await response.json(); } catch {}
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion returned.';
    } catch (error) {
        console.error('Error suggesting treatment:', error?.message || error);
        throw new Error(error?.message || 'Unknown error from Gemini');
    }
};

module.exports = {
    analyzeMedicalRecord,
    suggestTreatment
}; 