const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const PERMIT_API_KEY = process.env.PERMIT_API_KEY;
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'https://api.permit.io/v2';

async function getProjectId() {
  try {
    const response = await axios.get(`${PERMIT_API_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${PERMIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Projects:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.length > 0) {
      const project = response.data[0]; // Get the first project
      console.log('\nProject ID:', project.id);
      console.log('Project Key:', project.key);
      return project.id;
    } else {
      console.log('No projects found. Please create a project in the Permit.io dashboard first.');
    }
  } catch (error) {
    console.error('Error fetching project:', error.response?.data || error.message);
  }
}

getProjectId(); 