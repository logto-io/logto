import { generateStandardId } from '@logto/core-kit';
import { customAlphabet } from 'nanoid';

// Use lowercase letters for tenant IDs to improve compatibility
export const tenantIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

export type TenantMetadata = {
  id: string;
  parentRole: string;
  role: string;
  password: string;
};

export const createTenantMetadata = (
  databaseName: string,
  tenantId = customAlphabet(tenantIdAlphabet)(6)
): TenantMetadata => {
  const parentRole = `logto_tenant_${databaseName}`;
  const role = `logto_tenant_${databaseName}_${tenantId}`;
  const password = generateStandardId(32);

  return { id: tenantId, parentRole, role, password };
};
