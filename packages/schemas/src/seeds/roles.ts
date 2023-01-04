import type { CreateRole } from '../db-entries/index.js';
import { UserRole } from '../types/index.js';

export const adminConsoleAdminRoleId = 'ac-admin-id';

/**
 * Default Admin Role for Admin Console.
 */
export const defaultRole: Readonly<CreateRole> = {
  id: adminConsoleAdminRoleId,
  name: UserRole.Admin,
  description: 'Admin role for Logto.',
};
