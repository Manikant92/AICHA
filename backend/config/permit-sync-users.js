const axios = require('axios');
const { pool } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

// Permit.io configuration
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'https://api.permit.io/v2';

const headers = {
  Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
  'Content-Type': 'application/json',
};

function generateEmail(username) {
  // If username already contains @, return it as is
  if (username.includes('@')) {
    return username;
  }
  // Otherwise, append @example.com
  return `${username}@example.com`;
}

async function syncUserToPermit(user) {
  try {
    // Create or update user in Permit.io
    const userData = {
      key: user.id.toString(),
      email: generateEmail(user.username),
      attributes: {
        role: user.role,
        username: user.username
      }
    };

    console.log(`Syncing user: ${JSON.stringify(userData)}`);

    // First, try to create the user
    try {
      await axios.post(
        `${PERMIT_API_URL}/facts/${process.env.PERMIT_PROJECT_ID}/${process.env.PERMIT_ENVIRONMENT || 'dev'}/users`,
        userData,
        { headers }
      );
      console.log(`✅ User ${user.username} created in Permit.io`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`ℹ️ User ${user.username} already exists in Permit.io`);
      } else {
        throw error;
      }
    }

    // Then assign role to user
    const roleData = {
      role: user.role,
      user: user.id.toString(),
      tenant: 'default'
    };

    try {
      await axios.post(
        `${PERMIT_API_URL}/facts/${process.env.PERMIT_PROJECT_ID}/${process.env.PERMIT_ENVIRONMENT || 'dev'}/role_assignments`,
        roleData,
        { headers }
      );
      console.log(`✅ Role ${user.role} assigned to user ${user.username}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`ℹ️ Role ${user.role} already assigned to user ${user.username}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Error syncing user ${user.username}:`, error.response?.data || error.message);
  }
}

async function syncAllUsers() {
  try {
    console.log('🔍 Fetching users from database...');
    // Get all users from database
    const result = await pool.query('SELECT id, username, role FROM users');
    const users = result.rows;

    console.log(`📊 Found ${users.length} users to sync`);

    // Sync each user to Permit.io
    for (const user of users) {
      await syncUserToPermit(user);
    }

    console.log('✨ User sync completed successfully!');
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await pool.end();
  }
}

// Run the sync
syncAllUsers(); 