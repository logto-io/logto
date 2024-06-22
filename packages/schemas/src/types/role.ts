import { RoleType, type Role } from '../db-entries/index.js';

import { type FeaturedApplication } from './application.js';
import { type FeaturedUser } from './user.js';

export type RoleResponse = Role & {
  usersCount: number;
  featuredUsers: FeaturedUser[];
  applicationsCount: number;
  featuredApplications: FeaturedApplication[];
};

/** The role type to i18n key mapping. */
export const roleTypeToKey = Object.freeze({
  [RoleType.User]: 'user',
  [RoleType.MachineToMachine]: 'machine_to_machine',
} as const satisfies Record<RoleType, string>);
