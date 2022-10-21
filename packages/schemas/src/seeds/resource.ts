import type { CreateResource } from '../db-entries';

export const managementResource: Readonly<CreateResource> = Object.freeze({
  id: 'management-api',
  /**
   * The fixed resource indicator for Management APIs.
   *
   * Admin Console requires the access token of this resource to be functional.
   */
  indicator: 'https://api.logto.io',
  name: 'Logto Management API',
});
