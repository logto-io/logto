import { samlApplicationPatchGuard as originalSamlApplicationPatchGuard } from '@logto/schemas';

import { appLevelAccessControlEnabledGuard } from '../applications/types.js';

export const samlApplicationPatchGuard = originalSamlApplicationPatchGuard.extend({
  appLevelAccessControlEnabled: appLevelAccessControlEnabledGuard,
});
