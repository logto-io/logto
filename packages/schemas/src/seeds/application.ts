import { generateStandardId } from '@logto/core-kit';

import type {
  Application,
  CreateApplication,
  CreateApplicationsRole,
} from '../db-entries/index.js';
import { ApplicationType } from '../db-entries/index.js';

import { adminTenantId } from './tenant.js';

/**
 * The fixed application ID for Admin Console.
 *
 * This built-in application does not belong to any tenant in the OSS version.
 */
export const adminConsoleApplicationId = 'admin-console';

export const demoAppApplicationId = 'demo-app';

export const buildDemoAppDataForTenant = (tenantId: string): Application => ({
  tenantId,
  id: demoAppApplicationId,
  name: 'Live Preview',
  secret: '',
  description: 'Preview for Sign-in Experience.',
  type: ApplicationType.SPA,
  oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
  customClientMetadata: {},
  createdAt: 0,
});

export const createDefaultAdminConsoleApplication = (): Readonly<CreateApplication> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: adminConsoleApplicationId,
    name: 'Admin Console',
    secret: generateStandardId(),
    description: 'Logto Admin Console.',
    type: ApplicationType.SPA,
    oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
  });

export const createTenantMachineToMachineApplication = (
  tenantId: string
): Readonly<CreateApplication> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: generateStandardId(),
    name: 'Cloud Service',
    description: `Machine to machine application for tenant ${tenantId}`,
    secret: generateStandardId(),
    type: ApplicationType.MachineToMachine,
    oidcClientMetadata: {
      redirectUris: [],
      postLogoutRedirectUris: [],
    },
    customClientMetadata: {
      tenantId,
    },
  });

/** Create role for "tenant application (M2M)" in admin tenant */
export const createAdminTenantApplicationRole = (
  applicationId: string,
  roleId: string
): Readonly<CreateApplicationsRole> =>
  Object.freeze({
    id: generateStandardId(),
    tenantId: adminTenantId,
    applicationId,
    roleId,
  });
