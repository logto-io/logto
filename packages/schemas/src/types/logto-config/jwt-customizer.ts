import { z } from 'zod';

import { Roles, UserSsoIdentities, Organizations } from '../../db-entries/index.js';
import { jsonObjectGuard, mfaFactorsGuard } from '../../foundations/index.js';
import { scopeResponseGuard } from '../scope.js';
import { userInfoGuard } from '../user.js';

import { accessTokenPayloadGuard, clientCredentialsPayloadGuard } from './oidc-provider.js';

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

export const jwtCustomizerGuard = z
  .object({
    script: z.string(),
    environmentVariables: z.record(z.string()),
    contextSample: jsonObjectGuard,
  })
  .partial();

export const accessTokenJwtCustomizerGuard = jwtCustomizerGuard
  .extend({
    // Use partial token guard since users customization may not rely on all fields.
    tokenSample: accessTokenPayloadGuard.partial().optional(),
    contextSample: z.object({ user: jwtCustomizerUserContextGuard.partial() }).optional(),
  })
  .strict();

export type AccessTokenJwtCustomizer = z.infer<typeof accessTokenJwtCustomizerGuard>;

export const clientCredentialsJwtCustomizerGuard = jwtCustomizerGuard
  .extend({
    // Use partial token guard since users customization may not rely on all fields.
    tokenSample: clientCredentialsPayloadGuard.partial().optional(),
  })
  .strict();

export type ClientCredentialsJwtCustomizer = z.infer<typeof clientCredentialsJwtCustomizerGuard>;

export enum LogtoJwtTokenKeyType {
  AccessToken = 'access-token',
  ClientCredentials = 'client-credentials',
}

/**
 * This guard is for the core JWT customizer testing API request body guard.
 */
export const jwtCustomizerTestRequestBodyGuard = z.discriminatedUnion('tokenType', [
  z.object({
    tokenType: z.literal(LogtoJwtTokenKeyType.AccessToken),
    ...accessTokenJwtCustomizerGuard
      .required({
        script: true,
      })
      .pick({ environmentVariables: true, script: true }).shape,
    token: accessTokenJwtCustomizerGuard.required().shape.tokenSample,
    context: accessTokenJwtCustomizerGuard.required().shape.contextSample,
  }),
  z.object({
    tokenType: z.literal(LogtoJwtTokenKeyType.ClientCredentials),
    ...clientCredentialsJwtCustomizerGuard
      .required({
        script: true,
      })
      .pick({ environmentVariables: true, script: true }).shape,
    token: clientCredentialsJwtCustomizerGuard.required().shape.tokenSample,
  }),
]);

export type JwtCustomizerTestRequestBody = z.infer<typeof jwtCustomizerTestRequestBodyGuard>;

/**
 * This guard is for cloud API use (request body guard).
 * Since the cloud API will be use by both testing and production, should keep the fields as general as possible.
 * The response guard for the cloud API is `jsonObjectGuard` since it extends the `token` with extra claims.
 */
const commonJwtCustomizerGuard = jwtCustomizerGuard
  .pick({ script: true, environmentVariables: true })
  .required({ script: true })
  .extend({
    token: jsonObjectGuard,
  });

export const customJwtFetcherGuard = z.discriminatedUnion('tokenType', [
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenKeyType.AccessToken),
    context: jsonObjectGuard,
  }),
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenKeyType.ClientCredentials),
  }),
]);

export type CustomJwtFetcher = z.infer<typeof customJwtFetcherGuard>;
