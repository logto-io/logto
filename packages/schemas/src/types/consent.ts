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

export const consentInfoResponseGuard = z.object({
  application: publicApplicationGuard
    .merge(applicationSignInExperienceGuard.partial())
    /**
     * The CIMD metadata document's raw `logo_uri`; absent for registered applications, whose
     * logos travel in `branding`. Raw is interim — the draft-02 §8.8 prefetch-and-cache
     * serving is a pre-graduation follow-up. The document's terms and privacy links reuse
     * `termsOfUseUrl`/`privacyPolicyUrl` above, and the client kind is judged from `id` (a
     * CIMD client carries its identifier URL there), so no other CIMD-only field exists.
     */
    .extend({ logoUri: z.string().optional() }),
  user: publicUserInfoGuard,
  organizations: publicOrganizationGuard.array().optional(),
  missingOIDCScope: z.string().array().optional(),
  missingResourceScopes: missingResourceScopesGuard.array().optional(),
  // Device flow consent does not require a redirect_uri.
  redirectUri: z.string().optional(),
});

export type ConsentInfoResponse = z.infer<typeof consentInfoResponseGuard>;
