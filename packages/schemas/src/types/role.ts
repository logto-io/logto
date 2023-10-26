import type { Role } from '../db-entries/index.js';

import { type FeaturedApplication } from './application.js';
import { type FeaturedUser } from './user.js';

export type RoleResponse = Role & {
  usersCount: number;
  featuredUsers: FeaturedUser[];
  applicationsCount: number;
  featuredApplications: FeaturedApplication[];
};
