const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PERMIT_API_URL = process.env.PERMIT_API_URL || 'https://api.permit.io/v2';

const permitConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'permit.json'), 'utf8')
);

const headers = {
  Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
  'Content-Type': 'application/json',
};

async function getProject() {
  try {
    const response = await axios.get(`${PERMIT_API_URL}/projects`, { headers });
    if (response.data && response.data.length > 0) {
      const project = response.data[0];
      console.log('Project:', project);
      return project;
    } else {
      throw new Error('No projects found. Please create a project in the Permit.io dashboard first.');
    }
  } catch (error) {
    throw new Error('Error fetching project: ' + (error.response?.data?.detail || error.message));
  }
}

async function getOrCreateEnvironment(projectId) {
  try {
    const response = await axios.get(
      `${PERMIT_API_URL}/projects/${projectId}/envs`,
      { headers }
    );
    
    if (response.data && response.data.length > 0) {
      console.log('Found existing environments:', response.data.map(env => ({ key: env.key, id: env.id, name: env.name })));
      return response.data[0];
    }

    console.log('No environments found, creating development environment...');
    const createResponse = await axios.post(
      `${PERMIT_API_URL}/projects/${projectId}/envs`,
      {
        key: 'dev',
        name: 'Development',
        description: 'Development environment for AICHA'
      },
      { headers }
    );
    
    console.log('Created new environment:', createResponse.data);
    return createResponse.data;
  } catch (error) {
    throw new Error('Error with environment: ' + (error.response?.data?.detail || error.message));
  }
}

async function createDefaultTenant(projectId, envKey) {
  try {
    const tenantData = {
      key: 'default',
      name: 'Default Tenant',
      description: 'Default tenant for AICHA'
    };

    await axios.post(
      `${PERMIT_API_URL}/facts/${projectId}/${envKey}/tenants`,
      tenantData,
      { headers }
    );
    console.log('Default tenant created');
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('Default tenant already exists');
    } else {
      console.error('Error creating default tenant:', error.response?.data || error.message);
    }
  }
}

async function createResource(projectId, envKey, resourceKey, resource) {
  try {
    // First create the resource
    const resourceData = {
      key: resourceKey,
      name: resource.name,
      urn: `resource:${resourceKey}`,
      description: resource.description,
      attributes: {},
      actions: resource.actions.map(action => ({
        name: action,
        description: `${action} action for ${resource.name}`
      }))
    };

    await axios.post(
      `${PERMIT_API_URL}/schema/${projectId}/${envKey}/resources`,
      resourceData,
      { headers }
    );
    console.log(`Resource ${resourceKey} created`);

    // Then create actions for the resource
    for (const action of resource.actions) {
      const actionData = {
        name: action,
        description: `${action} action for ${resource.name}`
      };

      await axios.post(
        `${PERMIT_API_URL}/schema/${projectId}/${envKey}/resources/${resourceKey}/actions`,
        actionData,
        { headers }
      );
      console.log(`Action ${action} created for resource ${resourceKey}`);
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`Resource ${resourceKey} already exists`);
    } else {
      console.error(`Error creating resource ${resourceKey}:`, error.response?.data || error.message);
    }
  }
}

async function createRole(projectId, envKey, roleKey, role) {
  try {
    // First create the role
    const roleData = {
      key: roleKey,
      name: role.name,
      description: role.description
    };

    await axios.post(
      `${PERMIT_API_URL}/schema/${projectId}/${envKey}/roles`,
      roleData,
      { headers }
    );
    console.log(`Role ${roleKey} created`);

    // Then assign permissions to the role
    for (const permission of role.permissions) {
      const [action, resource] = permission.split(':');
      const permissionData = {
        action: action,
        resource: resource
      };

      await axios.post(
        `${PERMIT_API_URL}/schema/${projectId}/${envKey}/roles/${roleKey}/permissions`,
        permissionData,
        { headers }
      );
      console.log(`Permission ${permission} assigned to role ${roleKey}`);
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`Role ${roleKey} already exists`);
    } else {
      console.error(`Error creating role ${roleKey}:`, error.response?.data || error.message);
    }
  }
}

async function main() {
  try {
    // Step 1: Get project
    const project = await getProject();
    const projectId = project.id;

    // Step 2: Get or create environment
    const env = await getOrCreateEnvironment(projectId);
    const envKey = env.key;
    console.log(`Using environment: ${envKey}`);

    // Step 3: Create default tenant
    await createDefaultTenant(projectId, envKey);

    // Step 4: Create resources with their actions
    for (const [resourceKey, resource] of Object.entries(permitConfig.resources)) {
      await createResource(projectId, envKey, resourceKey, resource);
    }

    // Step 5: Create roles with their permissions
    for (const [roleKey, role] of Object.entries(permitConfig.roles)) {
      await createRole(projectId, envKey, roleKey, role);
    }

    console.log('Permit.io setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main(); 