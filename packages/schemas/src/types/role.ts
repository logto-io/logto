import type { Application, Role, User } from '../db-entries/index.js';

export type RoleResponse = Role & {
  usersCount: number;
  featuredUsers: Array<Pick<User, 'avatar' | 'id' | 'name'>>;
  applicationsCount: number;
  featuredApplications: Array<Pick<Application, 'id' | 'name'>>;
};
