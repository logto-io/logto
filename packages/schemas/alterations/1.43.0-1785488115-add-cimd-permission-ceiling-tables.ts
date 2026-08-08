import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * Add the tenant-level permission ceiling tables for client ID metadata document (CIMD) clients.
 * The ceiling is tenant-wide because CIMD clients are unregistered and have no per-client record
 * to attach configuration to. The tables reference the tenant and scope tables directly (not the
 * CIMD config row), so disabling CIMD does not wipe the permission settings.
 * Rows are an allowlist: an empty table allows nothing (deny-all), and an unrestricted state is not
 * expressible.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table cimd_user_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_scope varchar(64) not null,
        primary key (tenant_id, user_scope)
      );
    `);
    await applyTableRls(pool, 'cimd_user_scopes');

    await pool.query(sql`
      create table cimd_resource_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        scope_id varchar(21) not null,
        primary key (tenant_id, scope_id),
        foreign key (tenant_id, scope_id)
          references scopes (tenant_id, id) on update cascade on delete cascade
      );
    `);
    await applyTableRls(pool, 'cimd_resource_scopes');

    await pool.query(sql`
      create table cimd_organization_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_scope_id varchar(21) not null,
        primary key (tenant_id, organization_scope_id),
        foreign key (tenant_id, organization_scope_id)
          references organization_scopes (tenant_id, id) on update cascade on delete cascade
      );
    `);
    await applyTableRls(pool, 'cimd_organization_scopes');

    await pool.query(sql`
      create table cimd_organization_resource_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        scope_id varchar(21) not null,
        primary key (tenant_id, scope_id),
        foreign key (tenant_id, scope_id)
          references scopes (tenant_id, id) on update cascade on delete cascade
      );
    `);
    await applyTableRls(pool, 'cimd_organization_resource_scopes');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'cimd_organization_resource_scopes');
    await dropTableRls(pool, 'cimd_organization_scopes');
    await dropTableRls(pool, 'cimd_resource_scopes');
    await dropTableRls(pool, 'cimd_user_scopes');
    await pool.query(sql`
      drop table cimd_organization_resource_scopes;
      drop table cimd_organization_scopes;
      drop table cimd_resource_scopes;
      drop table cimd_user_scopes;
    `);
  },
};

export default alteration;
