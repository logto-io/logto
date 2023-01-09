import type { Role } from '@logto/schemas';

export type RoleDetailsOutletContext = {
  role: Role;
  isDeleting: boolean;
  onRoleUpdated: (role: Role) => void;
};
