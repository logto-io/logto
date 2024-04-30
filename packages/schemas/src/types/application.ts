import { UserScope } from '@logto/core-kit';
import { z } from 'zod';

import {
  Applications,
  type Application,
  OrganizationScopes,
  Resources,
  Scopes,
  ApplicationSignInExperiences,
} from '../db-entries/index.js';

export type ApplicationResponse = Application & { isAdmin: boolean };

/**
 * An application that is featured for display. Usually used in a list of resources that are
 * related to a group of applications.
 */
export type FeaturedApplication = Pick<Application, 'id' | 'name' | 'type'>;

/** The guard for {@link FeaturedApplication}. */
export const featuredApplicationGuard = Applications.guard.pick({
  id: true,
  name: true,
  type: true,
}) satisfies z.ZodType<FeaturedApplication>;

export const applicationCreateGuard = Applications.createGuard
  .omit({
    id: true,
    createdAt: true,
    secret: true,
    tenantId: true,
  })
  .partial()
  .merge(Applications.createGuard.pick({ name: true, type: true }));

export const applicationPatchGuard = applicationCreateGuard.partial().omit({
  type: true,
  isThirdParty: true,
});

const resourceScopesGuard = z.array(
  z.object({
    resource: Resources.guard.pick({ id: true, name: true, indicator: true }),
    scopes: z.array(Scopes.guard.pick({ id: true, name: true, description: true })),
  })
);

export const applicationUserConsentScopesResponseGuard = z.object({
  organizationScopes: z.array(
    OrganizationScopes.guard.pick({ id: true, name: true, description: true })
  ),
  resourceScopes: resourceScopesGuard,
  organizationResourceScopes: resourceScopesGuard,
  userScopes: z.array(z.nativeEnum(UserScope)),
});

export enum ApplicationUserConsentScopeType {
  OrganizationScopes = 'organization-scopes',
  ResourceScopes = 'resource-scopes',
  OrganizationResourceScopes = 'organization-resource-scopes',
  UserScopes = 'user-scopes',
}

export type ApplicationUserConsentScopesResponse = z.infer<
  typeof applicationUserConsentScopesResponseGuard
>;

export const applicationSignInExperienceCreateGuard = ApplicationSignInExperiences.createGuard
  .omit({
    applicationId: true,
    tenantId: true,
    termsOfUseUrl: true,
    privacyPolicyUrl: true,
  })
  // Align with the sign-in-experience create guard.
  .merge(
    z.object({
      termsOfUseUrl: z.string().max(2048).url().optional().nullable().or(z.literal('')),
      privacyPolicyUrl: z.string().max(2048).url().optional().nullable().or(z.literal('')),
    })
  );

export type ApplicationSignInExperienceCreate = z.infer<
  typeof applicationSignInExperienceCreateGuard
>;
