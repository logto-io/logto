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

export type UserInfo<Keys extends keyof CreateUser = typeof userInfoSelectFields[number]> = Pick<
  CreateUser,
  Keys
>;

export type UserProfileResponse = UserInfo & { hasPasswordSet: boolean };

export enum UserRole {
  Admin = 'admin',
  /** Common user role in admin tenant. */
  User = 'user',
}

export enum PredefinedScope {
  All = 'all',
}
