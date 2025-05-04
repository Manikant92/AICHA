const { Permit } = require('permitio');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Load permit configuration
const permitConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'permit.json'), 'utf8')
);

let permit;

const initializePermit = () => {
  try {
    permit = new Permit({
      token: process.env.PERMIT_API_KEY,
      pdp: "https://cloudpdp.api.permit.io",
      projectId: process.env.PERMIT_PROJECT_ID,
      env: process.env.PERMIT_ENVIRONMENT || 'dev'
    });

    // Sync roles and permissions from config
    syncPermitConfiguration();

    console.log('Permit.io initialized successfully');
    return permit;
  } catch (error) {
    console.error('Error initializing Permit.io:', error);
    throw error;
  }
};

const syncPermitConfiguration = async () => {
  try {
    // First, create all resources and their actions
    for (const [resourceKey, resource] of Object.entries(permitConfig.resources)) {
      try {
        // Transform actions into the format Permit.io expects
        const formattedActions = Object.entries(resource.actions).reduce((acc, [actionKey, action]) => {
          acc[actionKey] = {
            name: action.name,
            description: action.description
          };
          return acc;
        }, {});

        // Create the resource
        await permit.api.createResource({
          key: resourceKey,
          name: resource.name,
          description: resource.description,
          actions: formattedActions
        });

        console.log(`Resource ${resourceKey} created successfully`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`Resource ${resourceKey} already exists, skipping creation`);
          continue;
        }
        throw error;
      }
    }

    // Then create roles with their permissions
    for (const [roleKey, role] of Object.entries(permitConfig.roles)) {
      try {
        await permit.api.createRole({
          key: roleKey,
          name: role.name,
          description: role.description,
          permissions: role.permissions
        });
        console.log(`Role ${roleKey} created successfully`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`Role ${roleKey} already exists, skipping creation`);
          continue;
        }
        throw error;
      }
    }

    console.log('Permit.io configuration synced successfully');
  } catch (error) {
    console.error('Error syncing Permit.io configuration:', error);
    throw error;
  }
};

const checkPermission = async (user, action, resource) => {
  try {
    if (!permit) {
      throw new Error('Permit not initialized');
    }

    const permitted = await permit.check(user, action, resource);
    return permitted;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

const getPermit = () => {
  if (!permit) {
    throw new Error('Permit not initialized');
  }
  return permit;
};

module.exports = {
  initializePermit,
  checkPermission,
  getPermit
}; 