import { jsonObjectGuard } from '@logto/connector-kit';
import { type ZodType, z } from 'zod';

import {
  Organizations,
  type Organization,
  type Role,
  Roles,
  UserSsoIdentities,
  type UserSsoIdentity,
} from '../../db-entries/index.js';
import { mfaFactorsGuard, type MfaFactors } from '../../foundations/index.js';
import { GrantType } from '../oidc-config.js';
import { scopeResponseGuard, type ScopeResponse } from '../scope.js';
import { userInfoGuard, type UserInfo } from '../user.js';

import { accessTokenPayloadGuard, clientCredentialsPayloadGuard } from './oidc-provider.js';

export const jwtCustomizerGuard = z.object({
  script: z.string(),
  environmentVariables: z.record(z.string()).optional(),
  contextSample: jsonObjectGuard.optional(),
});

export enum LogtoJwtTokenKeyType {
  AccessToken = 'access-token',
  ClientCredentials = 'client-credentials',
}

export type JwtCustomizerUserContext = UserInfo & {
  hasPassword: boolean;
  ssoIdentities: Array<Pick<UserSsoIdentity, 'issuer' | 'identityId' | 'detail'>>;
  mfaVerificationFactors: MfaFactors;
  roles: Array<
    Pick<Role, 'id' | 'name' | 'description'> & {
      scopes: Array<Pick<ScopeResponse, 'id' | 'name' | 'description' | 'resourceId' | 'resource'>>;
    }
  >;
  organizations: Array<Pick<Organization, 'id' | 'name' | 'description'>>;
  organizationRoles: Array<{
    organizationId: string;
    roleId: string;
    roleName: string;
  }>;
};

export const jwtCustomizerUserContextGuard = userInfoGuard.extend({
  hasPassword: z.boolean(),
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
}) satisfies ZodType<JwtCustomizerUserContext>;

export const jwtCustomizerGrantContextGuard = z.object({
  type: z.literal(GrantType.TokenExchange), // Only support token exchange for now
  subjectTokenContext: jsonObjectGuard,
});

export type JwtCustomizerGrantContext = z.infer<typeof jwtCustomizerGrantContextGuard>;

export const accessTokenJwtCustomizerGuard = jwtCustomizerGuard
  .extend({
    // Use partial token guard since users customization may not rely on all fields.
    tokenSample: accessTokenPayloadGuard.partial().optional(),
    contextSample: z
      .object({
        user: jwtCustomizerUserContextGuard.partial(),
        grant: jwtCustomizerGrantContextGuard.partial().optional(),
      })
      .optional(),
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

/**
 * This guard is for the core JWT customizer testing API request body guard.
 * Unlike the DB guard
 *
 * - rename the `tokenSample` to `token` and is required for testing.
 * - rename the `contextSample` to `context` and is required for AccessToken testing.
 */
export const jwtCustomizerTestRequestBodyGuard = z.discriminatedUnion('tokenType', [
  z.object({
    tokenType: z.literal(LogtoJwtTokenKeyType.AccessToken),
    ...accessTokenJwtCustomizerGuard.pick({ environmentVariables: true, script: true }).shape,
    token: accessTokenJwtCustomizerGuard.required().shape.tokenSample,
    context: accessTokenJwtCustomizerGuard.required().shape.contextSample,
  }),
  z.object({
    tokenType: z.literal(LogtoJwtTokenKeyType.ClientCredentials),
    ...clientCredentialsJwtCustomizerGuard.pick({ environmentVariables: true, script: true }).shape,
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
