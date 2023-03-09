import type { CreateUser } from '../db-entries/index.js';

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

export type UserInfo<Keys extends keyof CreateUser = (typeof userInfoSelectFields)[number]> = Pick<
  CreateUser,
  Keys
>;

export type UserProfileResponse = UserInfo & { hasPassword?: boolean };

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
}

export enum PredefinedScope {
  All = 'all',
}
