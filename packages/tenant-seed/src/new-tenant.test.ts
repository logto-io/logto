import { beforeEach, describe, expect, it, vi } from 'vitest';

import { seedOidcConfigs } from './oidc-config.js';
import { seedPreConfiguredManagementApiAccessRole } from './roles.js';
import { seedTenant } from './new-tenant.js';
import { createTenant, seedAdminData } from './tenant.js';

vi.mock('./tenant.js', () => ({ createTenant: vi.fn(), seedAdminData: vi.fn() }));
vi.mock('./oidc-config.js', () => ({ seedOidcConfigs: vi.fn() }));
vi.mock('./roles.js', () => ({ seedPreConfiguredManagementApiAccessRole: vi.fn() }));

// The seed writes the admin console and ID token configs through `query`, so the mock connection needs it.
const connection = { query: vi.fn(async () => ({})) } as never;

describe('seedTenant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the tenant row before seeding any of its data', async () => {
    await seedTenant(connection, 'tenant-1');

    expect(createTenant).toHaveBeenCalledWith(connection, 'tenant-1', {});
    const createdAt = vi.mocked(createTenant).mock.invocationCallOrder[0] ?? Infinity;
    expect(createdAt).toBeLessThan(vi.mocked(seedOidcConfigs).mock.invocationCallOrder[0] ?? 0);
    expect(createdAt).toBeLessThan(vi.mocked(seedAdminData).mock.invocationCallOrder[0] ?? 0);
  });

  it('seeds the OIDC configs and the access role for the given tenant only', async () => {
    await seedTenant(connection, 'tenant-1');

    expect(seedOidcConfigs).toHaveBeenCalledWith(connection, 'tenant-1');
    expect(seedPreConfiguredManagementApiAccessRole).toHaveBeenCalledWith(connection, 'tenant-1');
  });

  it('builds the Management API resource for the given tenant, not the fixed ones', async () => {
    await seedTenant(connection, 'tenant-1');

    const [, adminData] = vi.mocked(seedAdminData).mock.calls[0] ?? [];
    expect(adminData?.resource.tenantId).toBe('tenant-1');
    expect(adminData?.resource.indicator).toBe('https://tenant-1.logto.app/api');
  });
});
