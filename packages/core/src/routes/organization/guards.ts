import { Organizations, organizationWithOrganizationRolesGuard } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

// DEV: MFA trusted devices
export const organizationHiddenFields = EnvSet.values.isDevFeaturesEnabled
  ? {}
  : { isTrustedDeviceAllowed: true as const };

export const organizationResponseGuard = Organizations.guard.omit(organizationHiddenFields);

export const organizationWithRolesResponseGuard =
  organizationWithOrganizationRolesGuard.omit(organizationHiddenFields);
