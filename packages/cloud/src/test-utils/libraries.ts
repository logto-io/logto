import type { TenantInfo } from '@logto/schemas';

import type { TenantsLibrary } from '#src/libraries/tenants.js';
import type { Queries } from '#src/queries/index.js';

const { jest } = import.meta;

export class MockTenantsLibrary implements TenantsLibrary {
  public get queries(): Queries {
    throw new Error('Not implemented.');
  }

  public getAvailableTenants = jest.fn<Promise<TenantInfo[]>, [string]>();
  public createNewTenant = jest.fn<Promise<TenantInfo>, [string]>();
}
