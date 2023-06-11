import type { ServiceLogType } from '@logto/schemas';
import type { TenantInfo, TenantTag } from '@logto/schemas/models';

import type { ServicesLibrary } from '#src/libraries/services.js';
import type { TenantsLibrary } from '#src/libraries/tenants.js';
import type { Queries } from '#src/queries/index.js';

const { jest } = import.meta;

export class MockTenantsLibrary implements TenantsLibrary {
  public get queries(): Queries {
    throw new Error('Not implemented.');
  }

  public getAvailableTenants = jest.fn<Promise<TenantInfo[]>, [string]>();
  public createNewTenant = jest.fn<Promise<TenantInfo>, [string, Record<string, unknown>]>();
  public updateTenantById = jest.fn<
    Promise<TenantInfo>,
    [string, { name?: string; tag?: TenantTag }]
  >();

  public deleteTenantById = jest.fn<Promise<void>, [string]>();
}

export class MockServicesLibrary implements ServicesLibrary {
  public get queries(): Queries {
    throw new Error('Not implemented.');
  }

  public getTenantIdFromApplicationId = jest.fn<Promise<string>, [string]>();

  public sendMessage = jest.fn();

  public getAdminTenantLogtoConnectors = jest.fn();

  public addLog = jest.fn();

  public getTenantBalanceForType = jest
    .fn<Promise<number>, [string, ServiceLogType]>()
    .mockResolvedValue(100);
}
