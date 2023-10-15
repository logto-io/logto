import type { AuthedRouter, RouterInitArgs } from '../types.js';

import adminUserBasicsRoutes from './basics.js';
import adminUserOrganizationRoutes from './organization.js';
import adminUserRoleRoutes from './role.js';
import adminUserSearchRoutes from './search.js';
import adminUserSocialRoutes from './social.js';

export default function adminUserRoutes<T extends AuthedRouter>(...args: RouterInitArgs<T>) {
  adminUserBasicsRoutes(...args);
  adminUserRoleRoutes(...args);
  adminUserSearchRoutes(...args);
  adminUserSocialRoutes(...args);
  adminUserOrganizationRoutes(...args);
}
