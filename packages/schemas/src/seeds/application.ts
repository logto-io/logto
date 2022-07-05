import { ApplicationType, CreateApplication } from '../db-entries';

/**
 * The fixed application ID for Admin Console.
 *
 * This built-in application does not belong to any tenant in the OSS version.
 */
export const adminConsoleApplicationId = 'admin-console';

export const demoAppApplicationId = 'demo-app';

export const createDemoAppApplication = (): Readonly<CreateApplication> => ({
  id: demoAppApplicationId,
  name: 'Demo App',
  description: 'Logto demo app.',
  type: ApplicationType.SPA,
  oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
});
