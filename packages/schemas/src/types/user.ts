import { UserUpdate } from '../db-entries';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
] as const);

export type UserInfo<Keys extends keyof UserUpdate = typeof userInfoSelectFields[number]> = Pick<
  UserUpdate,
  Keys
>;
