import type { Role, User } from '../db-entries/index.js';

export type RoleResponse = Role & {
  usersCount: number;
  featuredUsers: Array<Pick<User, 'avatar' | 'id' | 'name'>>;
};
