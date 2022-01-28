import { CreateUser } from '../db-entries';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
  'roleNames',
] as const);

export type UserInfo<Keys extends keyof CreateUser = typeof userInfoSelectFields[number]> = Pick<
  CreateUser,
  Keys
>;
