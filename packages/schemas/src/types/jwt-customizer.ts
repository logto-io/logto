import { z } from 'zod';

import {
  OrganizationRoles,
  OrganizationScopes,
  Resources,
  Roles,
  Scopes,
  UserSsoIdentities,
} from '../db-entries/index.js';
import { mfaFactorsGuard, jsonObjectGuard } from '../foundations/index.js';

import { jwtCustomizerGuard } from './logto-config/index.js';
import { userInfoGuard } from './user.js';

const organizationDetailGuard = z.object({
  roles: z.array(
    OrganizationRoles.guard.pick({ id: true, name: true }).extend({
      scopes: z.array(OrganizationScopes.guard.pick({ id: true, name: true, description: true })),
    })
  ),
});

export type OrganizationDetail = z.infer<typeof organizationDetailGuard>;

export const jwtCustomizerUserContextGuard = userInfoGuard.extend({
  ssoIdentities: z.array(
    UserSsoIdentities.guard.pick({ issuer: true, identityId: true, detail: true })
  ),
  mfaVerificationFactors: mfaFactorsGuard,
  roles: z.array(
    Roles.guard.pick({ id: true, name: true, description: true }).extend({
      scopes: z.array(
        Scopes.guard
          .pick({ id: true, name: true, description: true, resourceId: true })
          .merge(Resources.guard.pick({ indicator: true }))
      ),
    })
  ),
  organizations: z.record(organizationDetailGuard),
});

export type JwtCustomizerUserContext = z.infer<typeof jwtCustomizerUserContextGuard>;

/**
 * This guard is for cloud API use (request body guard).
 * Since the cloud API will be use by both testing and production, should keep the fields as general as possible.
 * The response guard for the cloud API is `jsonObjectGuard` since it extends the `token` with extra claims.
 */
export const customJwtFetcherGuard = jwtCustomizerGuard
  .pick({ script: true, envVars: true })
  .required({ script: true })
  .extend({
    token: jsonObjectGuard,
    context: jsonObjectGuard.optional(),
  });
