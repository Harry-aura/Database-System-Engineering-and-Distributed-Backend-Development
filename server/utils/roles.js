/**
 * Shared role constants.
 * @module utils/roles
 */
const Roles = Object.freeze({
  ADMIN: 'admin',
  RESIDENT: 'resident',
  SECURITY: 'security',
});

/** Roles that staff the society gate / backend operations. */
const adminOrSecurity = [Roles.ADMIN, Roles.SECURITY];

module.exports = { Roles, adminOrSecurity };