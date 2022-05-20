import { CreateResource } from '../db-entries';

export const managementResource: Readonly<CreateResource> = Object.freeze({
  id: 'management-api',
  indicator: 'https://api.logto.io',
  name: 'Logto Management API',
});
