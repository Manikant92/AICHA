const { checkPermission, getPermit } = require('./permit');
const { pool } = require('./database');

/**
 * Centralized Permit.io permission check with ABAC support and audit logging
 * @param {Object} user - The user object (must have id, role, username)
 * @param {string} action - The action to check (e.g., 'read', 'write', 'approve')
 * @param {string} resource - The resource key (e.g., 'patients', 'medical_analysis')
 * @param {Object} [attributes] - Optional resource/user attributes for ABAC
 * @returns {Promise<boolean>} - Whether the action is permitted
 */
async function checkAccess(user, action, resource, attributes = {}) {
  try {
    const permit = getPermit();
    // Permit.io ABAC: pass attributes as context
    const permitted = await permit.check({
      key: user.id,
      role: user.role,
      username: user.username,
      ...attributes
    }, action, resource, attributes);
    await logAudit(user.id, action, resource, `Permit check: ${permitted ? 'allowed' : 'denied'}`);
    return permitted;
  } catch (error) {
    await logAudit(user.id, action, resource, `Permit check error: ${error.message}`);
    return false;
  }
}

/**
 * Log an action to the audit log
 * @param {string} userId
 * @param {string} action
 * @param {string} resource
 * @param {string} details
 */
async function logAudit(userId, action, resource, details) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource, details) VALUES ($1, $2, $3, $4)',
      [userId, action, resource, details]
    );
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

module.exports = {
  checkAccess,
  logAudit
}; 