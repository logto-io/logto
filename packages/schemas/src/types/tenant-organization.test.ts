import { describe, expect, it } from 'vitest';

import { TenantRole, TenantScope, tenantRoleScopes } from './tenant-organization.js';

describe('tenantRoleScopes', () => {
  it('grants each tenant role its scopes', () => {
    expect(tenantRoleScopes).toEqual({
      [TenantRole.Admin]: Object.values(TenantScope),
      [TenantRole.Collaborator]: [
        TenantScope.ReadData,
        TenantScope.WriteData,
        TenantScope.DeleteData,
        TenantScope.ReadMember,
      ],
      [TenantRole.Viewer]: [TenantScope.ReadData, TenantScope.ReadMember],
    });
  });
});
