import { z } from 'zod';

import {
  Applications,
  Users,
  Organizations,
  Resources,
  Scopes,
  ApplicationSignInExperiences,
} from '../db-entries/index.js';

/**
 * Define the public user info that can be exposed to the public. e.g. on the user consent page.
 */
export const publicUserInfoGuard = Users.guard.pick({
  id: true,
  name: true,
  avatar: true,
  username: true,
  primaryEmail: true,
  primaryPhone: true,
});
export type PublicUserInfo = z.infer<typeof publicUserInfoGuard>;

/**
 * Define the public application info that can be exposed to the public. e.g. on the user consent page.
 *
 * The overrides lift the applications-table column length bounds: a CIMD client puts its
 * identifier URL (up to 2048 characters) in `id` and the remote document's `client_name`,
 * which no column bound governs, in `name`.
 */
export const publicApplicationGuard = Applications.guard
  .pick({
    id: true,
    name: true,
  })
  // DEV: CIMD (client ID metadata document) support
  .extend({
    id: z.string(),
    name: z.string(),
  });
export type PublicApplication = z.infer<typeof publicApplicationGuard>;
export const applicationSignInExperienceGuard = ApplicationSignInExperiences.guard.pick({
  branding: true,
  displayName: true,
  privacyPolicyUrl: true,
  termsOfUseUrl: true,
});

export const missingResourceScopesGuard = z.object({
  // The original resource id has a maximum length of 21 restriction. We need to make it compatible with the logto reserved organization name.
  // use string here, as we do not care about the resource id length here.
  resource: Resources.guard.pick({ name: true, indicator: true }).extend({ id: z.string() }),
  scopes: Scopes.guard.pick({ id: true, name: true, description: true }).array(),
});

/**
 * Define the missing resource scopes for the consent page.
 */
export type MissingResourceScopes = z.infer<typeof missingResourceScopesGuard>;

/**
 * Define the public organization info that can be exposed to the public. e.g. on the user consent page.
 */
export const publicOrganizationGuard = Organizations.guard
  .pick({
    id: true,
    name: true,
  })
  .extend({
    missingResourceScopes: missingResourceScopesGuard.array().optional(),
  });

export type PublicOrganization = z.infer<typeof publicOrganizationGuard>;

// DEV: CIMD (client ID metadata document) support
/**
 * The kind-agnostic client summary for the consent page: one flat object instead of a
 * discriminated union, so the experience renders by field presence without judging the client
 * kind. `id` is the OAuth client_id for both kinds (a registered application id or a CIMD
 * client identifier URL). The optional fields are present only for CIMD clients, resolved
 * server-side from the provider-validated metadata document; `name` falls back to the client
 * identifier hostname when the document carries no `client_name` (a compliant document without
 * a name must not break authorization).
 */
export const publicClientSummaryGuard = z.object({
  id: z.string(),
  name: z.string(),
  hostname: z.string().optional(),
  logoUri: z.string().optional(),
  clientUri: z.string().optional(),
  policyUri: z.string().optional(),
  tosUri: z.string().optional(),
});
export type PublicClientSummary = z.infer<typeof publicClientSummaryGuard>;

export const consentInfoResponseGuard = z.object({
  // DEV: CIMD (client ID metadata document) support
  /** Present only for registered applications; a CIMD client carries no application entity. */
  application: publicApplicationGuard.merge(applicationSignInExperienceGuard.partial()).optional(),
  client: publicClientSummaryGuard,
  user: publicUserInfoGuard,
  organizations: publicOrganizationGuard.array().optional(),
  missingOIDCScope: z.string().array().optional(),
  missingResourceScopes: missingResourceScopesGuard.array().optional(),
  // Device flow consent does not require a redirect_uri.
  redirectUri: z.string().optional(),
  /**
   * How the authorization `redirect_uri` matches the client's registered redirect URIs,
   * computed server-side from the registered values and the matcher — never trusted from the
   * client or the experience. Absent for device-flow consent, which carries no redirect URI.
   */
  redirectUriMatchType: z.enum(['exact', 'wildcard']).optional(),
});

export type ConsentInfoResponse = z.infer<typeof consentInfoResponseGuard>;
