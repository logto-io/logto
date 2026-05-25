import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const accessControlRelationTables = Object.freeze([
  'application_access_control_user_relations',
  'application_access_control_user_role_relations',
  'application_access_control_organization_relations',
  'application_access_control_org_role_relations',
]);

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications
        add column app_level_access_control_enabled boolean not null default false;

      create table application_access_control_user_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        primary key (tenant_id, application_id, user_id)
      );

      create table application_access_control_user_role_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        role_id varchar(21) not null
          references roles (id) on update cascade on delete cascade,
        primary key (tenant_id, application_id, role_id),
        constraint application_access_control_user_role_relations__role_type
          check (public.check_role_type(role_id, 'User'))
      );

      create table application_access_control_organization_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        primary key (tenant_id, application_id, organization_id)
      );

      create table application_access_control_org_role_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        primary key (tenant_id, application_id, organization_id, organization_role_id),
        constraint application_access_control_org_role_relations__role_type
          check (check_organization_role_type(organization_role_id, 'User'))
      );
    `);

    for (const table of accessControlRelationTables) {
      // eslint-disable-next-line no-await-in-loop
      await applyTableRls(pool, table);
    }
  },
  down: async (pool) => {
    for (const table of accessControlRelationTables) {
      // eslint-disable-next-line no-await-in-loop
      await dropTableRls(pool, table);
    }

    await pool.query(sql`
      drop table application_access_control_org_role_relations;
      drop table application_access_control_organization_relations;
      drop table application_access_control_user_role_relations;
      drop table application_access_control_user_relations;

      alter table applications
        drop column app_level_access_control_enabled;
    `);
  },
};

export default alteration;
