import type { CreateRole } from '../db-entries/index.js';
import { UserRole } from '../types/index.js';

/**
 * Default Admin Role for Admin Console.
 */
export const defaultRole: Readonly<CreateRole> = {
  name: UserRole.Admin,
  description: 'Admin role for Logto.',
};
