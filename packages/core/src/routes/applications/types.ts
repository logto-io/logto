import { UserScope } from '@logto/core-kit';
import {
  applicationCreateGuard as originalApplicationCreateGuard,
  applicationPatchGuard as originalApplicationPatchGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

const protectedAppAdditionalScopes = [
  UserScope.CustomData,
  UserScope.Identities,
  UserScope.Roles,
  UserScope.Organizations,
  UserScope.OrganizationRoles,
] as const;
const protectedAppAdditionalScopeGuard = z.enum(protectedAppAdditionalScopes);

export const applicationCreateGuard = originalApplicationCreateGuard
  .omit({
    protectedAppMetadata: true,
  })
  .extend({
    protectedAppMetadata: z
      .object({
        subDomain: z.string(),
        origin: z.string(),
      })
      .optional(),
  });

export const applicationPatchGuard = originalApplicationPatchGuard
  .omit({
    protectedAppMetadata: true,
  })
  .extend({
    protectedAppMetadata: z
      .object({
        origin: z.string().optional(),
        sessionDuration: z.number().optional(),
        pageRules: z
          .array(
            z.object({
              /* The path pattern (regex) to match */
              path: z.string(),
            })
          )
          .optional(),
        additionalScopes: z.preprocess(
          (value) => (EnvSet.values.isDevFeaturesEnabled ? value : undefined),
          z.array(protectedAppAdditionalScopeGuard).optional()
        ),
      })
      .nullish(),
  });
