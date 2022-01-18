import { UserCreate } from '../db-entries';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
] as const);

export type UserInfo<Keys extends keyof UserCreate = typeof userInfoSelectFields[number]> = Pick<
  UserCreate,
  Keys
>;
