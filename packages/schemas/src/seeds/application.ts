import { generateStandardId, generateStandardSecret } from '@logto/shared/universal';

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
export const accountCenterApplicationId = 'account-center';

const buildSpaApplicationData = (
  tenantId: string,
  {
    id,
    name,
    description,
  }: {
    id: string;
    name: string;
    description: string;
  }
): Application => ({
  tenantId,
  id,
  name,
  secret: 'N/A',
  description,
  type: ApplicationType.SPA,
  oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
  customClientMetadata: {},
  protectedAppMetadata: null,
  isThirdParty: false,
  createdAt: 0,
  customData: {},
});

export const buildDemoAppDataForTenant = (tenantId: string): Application =>
  buildSpaApplicationData(tenantId, {
    id: demoAppApplicationId,
    name: 'Live Preview',
    description: 'Preview for Sign-in Experience.',
  });

export const buildAccountCenterAppDataForTenant = (tenantId: string): Application =>
  buildSpaApplicationData(tenantId, {
    id: accountCenterApplicationId,
    name: 'Account Center',
    description: 'Placeholder application for Account Center.',
  });

export type BuiltInApplicationId = typeof demoAppApplicationId | typeof accountCenterApplicationId;

export const isBuiltInApplicationId = (
  applicationId: string
): applicationId is BuiltInApplicationId =>
  applicationId === demoAppApplicationId || applicationId === accountCenterApplicationId;

export const isBuiltInClientId = isBuiltInApplicationId;

export const buildBuiltInApplicationDataForTenant = (
  tenantId: string,
  applicationId: BuiltInApplicationId
): Application => {
  if (applicationId === demoAppApplicationId) {
    return buildDemoAppDataForTenant(tenantId);
  }

  return buildAccountCenterAppDataForTenant(tenantId);
};

export const createDefaultAdminConsoleApplication = (): Readonly<CreateApplication> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: adminConsoleApplicationId,
    name: 'Admin Console',
    secret: generateStandardSecret(),
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
    secret: generateStandardSecret(),
    type: ApplicationType.MachineToMachine,
    oidcClientMetadata: {
      redirectUris: [],
      postLogoutRedirectUris: [],
    },
    customClientMetadata: {
      tenantId,
    },
  });

/** Create an entry to assign a role to an application in the admin tenant. */
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
