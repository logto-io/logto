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

/**
 * The application response returned by Management APIs.
 *
 * The legacy client secret is only present before it has been replaced by an internal secret.
 */
export const applicationResponseGuard = Applications.guard.extend({
  secret: Applications.guard.shape.secret.optional(),
});

export type ApplicationApiResponse = z.infer<typeof applicationResponseGuard>;

export type ApplicationResponse = ApplicationApiResponse & { isAdmin: boolean };

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
    appLevelAccessControlEnabled: true,
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

const applicationAccessControlRuleLimit = 1000;
const applicationAccessControlRawRuleLimit = applicationAccessControlRuleLimit * 2;
const uniqueStringArrayGuard = z
  .array(z.string())
  .max(applicationAccessControlRawRuleLimit)
  .transform((values) => [...new Set(values)])
  .pipe(z.array(z.string()).max(applicationAccessControlRuleLimit));

/** The guard for one organization role access-control rule group. */
export const applicationAccessControlOrganizationRoleRuleGuard = z.object({
  organizationId: z.string(),
  organizationRoleIds: uniqueStringArrayGuard,
});

/** The guard for application-level access control rule payloads. */
export const applicationAccessControlGuard = z
  .object({
    userIds: uniqueStringArrayGuard,
    userRoleIds: uniqueStringArrayGuard,
    organizationIds: uniqueStringArrayGuard,
    organizationRoleRules: z
      .array(applicationAccessControlOrganizationRoleRuleGuard)
      .max(applicationAccessControlRawRuleLimit),
  })
  .transform(({ organizationRoleRules, ...rest }) => {
    const organizationRoleRulesMap = new Map<string, Set<string>>();

    for (const { organizationId, organizationRoleIds } of organizationRoleRules) {
      const roleIds = organizationRoleRulesMap.get(organizationId) ?? new Set<string>();

      for (const roleId of organizationRoleIds) {
        roleIds.add(roleId);
      }

      organizationRoleRulesMap.set(organizationId, roleIds);
    }

    return {
      ...rest,
      organizationRoleRules: [...organizationRoleRulesMap.entries()].map(
        ([organizationId, organizationRoleIds]) => ({
          organizationId,
          organizationRoleIds: [...organizationRoleIds],
        })
      ),
    };
  })
  .pipe(
    z.object({
      userIds: z.array(z.string()).max(applicationAccessControlRuleLimit),
      userRoleIds: z.array(z.string()).max(applicationAccessControlRuleLimit),
      organizationIds: z.array(z.string()).max(applicationAccessControlRuleLimit),
      organizationRoleRules: z
        .array(applicationAccessControlOrganizationRoleRuleGuard)
        .max(applicationAccessControlRuleLimit),
    })
  );

export type ApplicationAccessControl = z.infer<typeof applicationAccessControlGuard>;

/** Create an empty application-level access control rule set. */
export const createDefaultApplicationAccessControl = (): ApplicationAccessControl => ({
  userIds: [],
  userRoleIds: [],
  organizationIds: [],
  organizationRoleRules: [],
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
