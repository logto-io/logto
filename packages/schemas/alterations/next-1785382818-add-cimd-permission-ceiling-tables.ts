import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Support tenant-aware composite foreign keys from tenant-owned scope relations.
    await pool.query(sql`
      alter table scopes
        add constraint scopes__tenant_id_id
          unique (tenant_id, id);

      alter table organization_scopes
        add constraint organization_scopes__tenant_id_id
          unique (tenant_id, id);
    `);

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
          references scopes (tenant_id, id)
          on update cascade on delete cascade
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
          references organization_scopes (tenant_id, id)
          on update cascade on delete cascade
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
          references scopes (tenant_id, id)
          on update cascade on delete cascade
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

      alter table organization_scopes
        drop constraint organization_scopes__tenant_id_id;

      alter table scopes
        drop constraint scopes__tenant_id_id;
    `);
  },
};

export default alteration;
