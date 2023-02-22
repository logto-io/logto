import { generateStandardId } from '@logto/core-kit';

import type { CreateApplication } from '../db-entries/index.js';
import { ApplicationType } from '../db-entries/index.js';
import { adminTenantId } from './tenant.js';

/**
 * The fixed application ID for Admin Console.
 *
 * This built-in application does not belong to any tenant in the OSS version.
 */
export const adminConsoleApplicationId = 'admin-console';

export const demoAppApplicationId = 'demo-app';

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
