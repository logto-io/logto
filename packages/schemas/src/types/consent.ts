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
 * identifier URL (up to 2048 characters) in both `id` and `name`.
 */
export const publicApplicationGuard = Applications.guard
  .pick({
    id: true,
    name: true,
  })
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

/**
 * Display metadata for CIMD clients, resolved server-side from the provider-validated
 * metadata document and absent for registered applications. Purely additive so every
 * consumer of the consent info keeps its shape: the experience renders by field presence,
 * where a present `hostname` marks an unregistered external client and is the unforgeable
 * identity signal to pair with the display name (draft-02 §8.5). The document's `logo_uri`
 * is deliberately absent: a browser-ready remote URL is a tracking and content-swap surface
 * (draft-02 §8.8), so logos wait for a Logto-served cached asset.
 */
const cimdClientDisplayGuard = z.object({
  hostname: z.string().optional(),
  clientUri: z.string().optional(),
  policyUri: z.string().optional(),
  tosUri: z.string().optional(),
});

export const consentInfoResponseGuard = z.object({
  application: publicApplicationGuard
    .merge(applicationSignInExperienceGuard.partial())
    .merge(cimdClientDisplayGuard),
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
