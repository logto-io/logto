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
 */
export const publicApplicationGuard = Applications.guard.pick({
  id: true,
  name: true,
});
export type PublicApplication = z.infer<typeof publicApplicationGuard>;
export const applicationSignInExperienceGuard = ApplicationSignInExperiences.guard.pick({
  branding: true,
  displayName: true,
  privacyPolicyUrl: true,
  termsOfUseUrl: true,
});

/**
 * Define the public organization info that can be exposed to the public. e.g. on the user consent page.
 */
export const publicOrganizationGuard = Organizations.guard.pick({
  id: true,
  name: true,
});
export const missingResourceScopesGuard = z.object({
  resource: Resources.guard.pick({ id: true, name: true }),
  scopes: Scopes.guard.pick({ id: true, name: true, description: true }).array(),
});

/**
 * Define the missing resource scopes for the consent page.
 */
export type MissingResourceScopes = z.infer<typeof missingResourceScopesGuard>;

export const consentInfoResponseGuard = z.object({
  application: publicApplicationGuard.merge(applicationSignInExperienceGuard.partial()),
  user: publicUserInfoGuard,
  organizations: publicOrganizationGuard.array().optional(),
  missingOIDCScope: z.string().array().optional(),
  missingResourceScopes: missingResourceScopesGuard.array().optional(),
});

export type ConsentInfoResponse = z.infer<typeof consentInfoResponseGuard>;
