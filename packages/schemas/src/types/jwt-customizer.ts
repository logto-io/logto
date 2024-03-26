import { z } from 'zod';

import { Roles, UserSsoIdentities, Organizations } from '../db-entries/index.js';
import { jsonObjectGuard, mfaFactorsGuard } from '../foundations/index.js';

import { jwtCustomizerGuard } from './logto-config/index.js';
import { scopeResponseGuard } from './scope.js';
import { userInfoGuard } from './user.js';

export const jwtCustomizerUserContextGuard = userInfoGuard.extend({
  ssoIdentities: UserSsoIdentities.guard
    .pick({ issuer: true, identityId: true, detail: true })
    .array(),
  mfaVerificationFactors: mfaFactorsGuard,
  roles: Roles.guard
    .pick({ id: true, name: true, description: true })
    .extend({
      scopes: scopeResponseGuard
        .pick({ id: true, name: true, description: true, resourceId: true, resource: true })
        .array(),
    })
    .array(),
  organizations: Organizations.guard.pick({ id: true, name: true, description: true }).array(),
  organizationRoles: z
    .object({
      organizationId: z.string(),
      roleId: z.string(),
      roleName: z.string(),
    })
    .array(),
});

export type JwtCustomizerUserContext = z.infer<typeof jwtCustomizerUserContextGuard>;

export enum LogtoJwtTokenPath {
  AccessToken = 'access-token',
  ClientCredentials = 'client-credentials',
}

/**
 * This guard is for cloud API use (request body guard).
 * Since the cloud API will be use by both testing and production, should keep the fields as general as possible.
 * The response guard for the cloud API is `jsonObjectGuard` since it extends the `token` with extra claims.
 */
const commonJwtCustomizerGuard = jwtCustomizerGuard
  .pick({ script: true, envVars: true })
  .required({ script: true })
  .extend({
    token: jsonObjectGuard,
  });

export const customJwtFetcherGuard = z.discriminatedUnion('tokenType', [
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenPath.AccessToken),
    context: jsonObjectGuard,
  }),
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenPath.ClientCredentials),
  }),
]);

export type CustomJwtFetcher = z.infer<typeof customJwtFetcherGuard>;
