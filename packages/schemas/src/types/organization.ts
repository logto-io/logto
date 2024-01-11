import { z } from 'zod';

import {
  type OrganizationRole,
  OrganizationRoles,
  type Organization,
  Organizations,
  type OrganizationInvitation,
  type MagicLink,
  OrganizationInvitations,
  MagicLinks,
} from '../db-entries/index.js';

import { type UserInfo, type FeaturedUser, userInfoGuard } from './user.js';

/**
 * The simplified organization scope entity that is returned for some endpoints.
 */
export type OrganizationScopeEntity = {
  id: string;
  name: string;
};

export type OrganizationRoleWithScopes = OrganizationRole & {
  scopes: OrganizationScopeEntity[];
};

export const organizationRoleWithScopesGuard: z.ZodType<OrganizationRoleWithScopes> =
  OrganizationRoles.guard.extend({
    scopes: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
  });

/**
 * The simplified organization role entity that is returned in the `roles` field
 * of the organization.
 */
export type OrganizationRoleEntity = {
  id: string;
  name: string;
};

const organizationRoleEntityGuard: z.ZodType<OrganizationRoleEntity> = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * The organization entity with the `organizationRoles` field that contains the
 * roles of the current member of the organization.
 */
export type OrganizationWithRoles = Organization & {
  /** The roles of the current member of the organization. */
  organizationRoles: OrganizationRoleEntity[];
};

export const organizationWithOrganizationRolesGuard: z.ZodType<OrganizationWithRoles> =
  Organizations.guard.extend({
    organizationRoles: organizationRoleEntityGuard.array(),
  });

/**
 * The user entity with the `organizationRoles` field that contains the roles of
 * the user in a specific organization.
 */
export type UserWithOrganizationRoles = UserInfo & {
  /** The roles of the user in a specific organization. */
  organizationRoles: OrganizationRoleEntity[];
};

export const userWithOrganizationRolesGuard: z.ZodType<UserWithOrganizationRoles> =
  userInfoGuard.extend({
    organizationRoles: organizationRoleEntityGuard.array(),
  });

/**
 * The organization entity with optional `usersCount` and `featuredUsers` fields.
 * They are useful for displaying the organization list in the frontend.
 */
export type OrganizationWithFeatured = Organization & {
  usersCount?: number;
  featuredUsers?: FeaturedUser[];
};

/**
 * The organization invitation with additional fields:
 *
 * - `magicLink`: The magic link that can be used to accept the invitation.
 * - `organizationRoles`: The roles to be assigned to the user when accepting the invitation.
 */
export type OrganizationInvitationEntity = OrganizationInvitation & {
  magicLink: MagicLink;
  organizationRoles: OrganizationRoleEntity[];
};

export const organizationInvitationEntityGuard: z.ZodType<OrganizationInvitationEntity> =
  OrganizationInvitations.guard.extend({
    magicLink: MagicLinks.guard,
    organizationRoles: organizationRoleEntityGuard.array(),
  });
