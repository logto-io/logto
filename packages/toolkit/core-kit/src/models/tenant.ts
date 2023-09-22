import { generateStandardId } from '@logto/shared/universal';

// Use lowercase letters for tenant IDs to improve compatibility
const generateTenantId = () => generateStandardId(6);

export type TenantMetadata = {
  id: string;
  parentRole: string;
  role: string;
  password: string;
};

export const createTenantMetadata = (
  databaseName: string,
  tenantId = generateTenantId()
): TenantMetadata => {
  const parentRole = `logto_tenant_${databaseName}`;
  const role = `logto_tenant_${databaseName}_${tenantId}`;
  const password = generateStandardId(32);

  return { id: tenantId, parentRole, role, password };
};
