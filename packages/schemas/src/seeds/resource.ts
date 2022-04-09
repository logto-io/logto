import { CreateResource } from '../db-entries';

export const managementResource: Readonly<CreateResource> = Object.freeze({
  id: 'management-api',
  indicator: 'https://logto.io/api',
  name: 'Logto Management API',
});
