import { generateStandardId } from '@logto/core-kit';

import type { CreateApplication } from '../db-entries/index.js';
import { ApplicationType } from '../db-entries/index.js';

/**
 * The fixed application ID for Admin Console.
 *
 * This built-in application does not belong to any tenant in the OSS version.
 */
export const adminConsoleApplicationId = 'admin-console';

export const demoAppApplicationId = 'demo-app';

/** @deprecated Demo app database entity will be removed soon. */
export const createDemoAppApplication = (forTenantId: string): Readonly<CreateApplication> => ({
  tenantId: forTenantId,
  id: demoAppApplicationId,
  secret: generateStandardId(),
  name: 'Demo App',
  description: 'Logto demo app.',
  type: ApplicationType.SPA,
  oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
});
