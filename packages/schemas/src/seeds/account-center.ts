import type { CreateAccountCenter } from '../db-entries/index.js';

export const createDefaultAccountCenter = (forTenantId: string): Readonly<CreateAccountCenter> =>
  Object.freeze({
    tenantId: forTenantId,
    id: 'default',
    enabled: false,
    fields: {},
  });
