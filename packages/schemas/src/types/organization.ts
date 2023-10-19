import { z } from 'zod';

import { type OrganizationRole, OrganizationRoles } from '../db-entries/index.js';

export type OrganizationRoleWithScopes = OrganizationRole & {
  scopes: Array<{
    id: string;
    name: string;
  }>;
};

export const organizationRoleWithScopesGuard: z.ZodType<OrganizationRoleWithScopes> =
  OrganizationRoles.guard.extend({
    scopes: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
  });
