import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create function check_application_type(application_id varchar(21), target_type application_type) returns boolean as
      $$ begin
        return (select type from applications where id = application_id) = target_type;
      end; $$ language plpgsql;
      create table organization_application_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_id, application_id),
        constraint application_type
          check (check_application_type(application_id, 'MachineToMachine'))
      );
    `);
    await applyTableRls(pool, 'organization_application_relations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_application_relations');
    await pool.query(sql`
      drop table organization_application_relations;
      drop function check_application_type;
    `);
  },
};

export default alteration;
