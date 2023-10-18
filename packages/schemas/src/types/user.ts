import { z } from 'zod';

import { Users } from '../db-entries/index.js';
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
  'applicationId',
  'isSuspended',
] as const);

export const userInfoGuard = Users.guard.pick(
  Object.fromEntries(userInfoSelectFields.map((key) => [key, true]))
);

export type UserInfo = z.infer<typeof userInfoGuard>;

export const userProfileResponseGuard = userInfoGuard.extend({
  hasPassword: z.boolean().optional(),
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
  Admin = 'admin',
  /** Common user role in admin tenant. */
  User = 'user',
  /** The role for machine to machine applications that represent a user tenant and send requests to Logto Cloud. */
  TenantApplication = 'tenantApplication',
}

export enum PredefinedScope {
  All = 'all',
}
