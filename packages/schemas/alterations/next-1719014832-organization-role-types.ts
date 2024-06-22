import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organization_roles
        add column type role_type not null default 'User';
      create function check_organization_role_type(role_id varchar(21), target_type role_type) returns boolean as
        $$ begin
          return (select type from organization_roles where id = role_id) = target_type;
        end; $$ language plpgsql;
      alter table organization_role_user_relations
        add constraint organization_role_user_relations__role_type
          check (check_organization_role_type(organization_role_id, 'User'));
      alter table organization_role_application_relations
        add constraint organization_role_application_relations__role_type
          check (check_organization_role_type(organization_role_id, 'MachineToMachine'));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_role_application_relations
        drop constraint organization_role_application_relations__role_type;
      alter table organization_role_user_relations
        drop constraint organization_role_user_relations__role_type;
      alter table organization_roles
        drop column type;
      drop function check_organization_role_type;
    `);
  },
};

export default alteration;
