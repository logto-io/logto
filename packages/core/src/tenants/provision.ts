import {
  adminTenantId,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
  LogtoTenantConfigKey,
  TenantRole,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared/universal';
import { seedTenant } from '@logto/tenant-seed';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { EnvSet } from '#src/env-set/index.js';

export type ProvisionTenantInput = {
  name: string;
  tag: string;
  regionName?: string;
  /** The user who creates the tenant. They become its admin. */
  creatorId: string;
};

/**
 * The tenant organization ID is `t-<tenant ID>`, and organization IDs are at most 21 characters. A
 * 19-character tenant ID keeps the organization ID within that limit.
 */
const tenantIdLength = 19;

/**
 * Makes the creator a member of the new tenant's organization, with the tenant admin role. The
 * organization lives in the admin tenant, which is where the console's organization token is issued.
 */
const addCreatorToTenantOrganization = async (
  connection: DatabaseTransactionConnection,
  { tenantId, name, creatorId }: { tenantId: string; name: string; creatorId: string }
) => {
  const organizationId = getTenantOrganizationId(tenantId);

  await connection.query(sql`
    insert into organizations (tenant_id, id, name)
    values (${adminTenantId}, ${organizationId}, ${name});
  `);
  await connection.query(sql`
    insert into organization_user_relations (tenant_id, organization_id, user_id)
    values (${adminTenantId}, ${organizationId}, ${creatorId});
  `);
  await connection.query(sql`
    insert into organization_role_user_relations
      (tenant_id, organization_id, organization_role_id, user_id)
    values (${adminTenantId}, ${organizationId}, ${getTenantRole(TenantRole.Admin).id}, ${creatorId});
  `);
};

/**
 * Create a tenant on the shared database: its row, its database role, its seed data, and its creator's
 * admin membership. The steps run in one transaction, so a failure in any of them leaves nothing behind.
 */
export const provisionTenant = async ({
  name,
  tag,
  regionName,
  creatorId,
}: ProvisionTenantInput) => {
  const tenantId = generateStandardId().slice(0, tenantIdLength);
  const pool = await EnvSet.sharedPool;

  await pool.transaction(async (connection) => {
    await seedTenant(connection, tenantId, { name, tag, regionName });
    await addCreatorToTenantOrganization(connection, { tenantId, name, creatorId });
    // The cloud connection lets the tenant call the cloud service (subscription, skus, regions). Every
    // tenant uses the same connection as the default tenant.
    await connection.query(sql`
      insert into logto_configs (tenant_id, key, value)
      select ${tenantId}, key, value
      from logto_configs
      where tenant_id = ${defaultTenantId} and key = ${LogtoTenantConfigKey.CloudConnection}
      on conflict do nothing;
    `);
  });

  return tenantId;
};
