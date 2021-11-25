import { UserDBEntry } from '../db-entries';

export const userInfoSelectFields = Object.freeze([
  'id',
  'username',
  'primaryEmail',
  'primaryPhone',
  'block',
] as const);

export type UserInfo<Keys extends keyof UserDBEntry = typeof userInfoSelectFields[number]> = Pick<
  UserDBEntry,
  Keys
>;
