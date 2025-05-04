const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const PERMIT_API_KEY = process.env.PERMIT_API_KEY;
const PROJECT_ID = process.env.PERMIT_PROJECT_ID;
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'https://api.permit.io/v2';

async function getEnvironments() {
  try {
    const response = await axios.get(
      `${PERMIT_API_URL}/projects/${PROJECT_ID}/envs`,
      {
        headers: {
          'Authorization': `Bearer ${PERMIT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Environments:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching environments:', error.response?.data || error.message);
  }
}

getEnvironments(); 