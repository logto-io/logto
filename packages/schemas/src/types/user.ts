import { CreateUser } from '../db-entries';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
  'name',
  'avatar',
  'roleNames',
  'customData',
  'identities',
  'lastSignInAt',
  'createdAt',
  'applicationId',
] as const);

export type UserInfo<Keys extends keyof CreateUser = typeof userInfoSelectFields[number]> = Pick<
  CreateUser,
  Keys
>;

export enum UserRole {
  Admin = 'admin',
}
