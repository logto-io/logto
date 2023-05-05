import { Users } from '../db-entries/index.js';
import type { User } from '../db-entries/index.js';
import { type CreateGuard } from '../index.js';

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

export type UserInfo<Keys extends keyof User = (typeof userInfoSelectFields)[number]> = Pick<
  User,
  Keys
>;

export const userInfoResponseGuard: CreateGuard<UserInfo> = Users.guard.pick({
  id: true,
  username: true,
  primaryEmail: true,
  primaryPhone: true,
  name: true,
  avatar: true,
  customData: true,
  identities: true,
  lastSignInAt: true,
  createdAt: true,
  applicationId: true,
  isSuspended: true,
});

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
  /** The role for machine to machine applications that represent a user tenant and send requests to Logto Cloud. */
  TenantApplication = 'tenantApplication',
}

export enum PredefinedScope {
  All = 'all',
}
