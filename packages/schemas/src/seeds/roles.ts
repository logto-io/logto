import type { CreateRole } from '../db-entries';
import { UserRole } from '../types';

/**
 * Default Admin Role for Admin Console.
 */
export const defaultRole: Readonly<CreateRole> = {
  name: UserRole.Admin,
  description: 'Admin role for Logto.',
};
