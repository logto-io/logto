import { z } from 'zod';

import { type User, Users, UserSsoIdentities } from '../db-entries/index.js';
import { MfaFactor } from '../foundations/index.js';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
  'name',
  'avatar',
  'customData',
  'identities',
  'lastSignInAt',
  'createdAt',
  'updatedAt',
  'profile',
  'applicationId',
  'isSuspended',
] satisfies Array<keyof User>);

export const userInfoGuard = Users.guard.pick(
  // eslint-disable-next-line no-restricted-syntax
  Object.fromEntries(userInfoSelectFields.map((field) => [field, true])) as Record<
    (typeof userInfoSelectFields)[number],
    true
  >
);

export type UserInfo = z.infer<typeof userInfoGuard>;

export const userProfileResponseGuard = userInfoGuard.extend({
  hasPassword: z.boolean().optional(),
  ssoIdentities: z.array(UserSsoIdentities.guard).optional(),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseGuard>;

export const userMfaVerificationResponseGuard = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    type: z.nativeEnum(MfaFactor),
    agent: z.string().optional(),
    remainCodes: z.number().optional(),
  })
  .array();

export type UserMfaVerificationResponse = z.infer<typeof userMfaVerificationResponseGuard>;

/** Internal read-only roles for user tenants. */
export enum InternalRole {
  /**
   * Internal admin role for Machine-to-Machine apps in Logto user tenants.
   *
   * It should NOT be assigned to any user.
   */
  Admin = '#internal:admin',
}

export enum AdminTenantRole {
  /** Common user role in admin tenant. */
  User = 'user',
  /** The role for machine to machine applications that represent a user tenant and send requests to Logto Cloud. */
  TenantApplication = 'tenantApplication',
}

export enum PredefinedScope {
  All = 'all',
}

/**
 * A user that is featured for display. Usually used in a list of resources that are related to
 * a group of users.
 */
export type FeaturedUser = Pick<User, 'id' | 'avatar' | 'name'>;

/** The guard for {@link FeaturedUser}. */
export const featuredUserGuard = Users.guard.pick({
  id: true,
  avatar: true,
  name: true,
}) satisfies z.ZodType<FeaturedUser>;
