import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type application_type add value 'SAML';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_application_relations drop constraint application_type;
      alter table application_secrets drop constraint application_type;
      alter table sso_connector_idp_initiated_auth_configs drop constraint application_type;

      drop function check_application_type;

      create type application_type_new as enum ('Native', 'SPA', 'Traditional', 'MachineToMachine', 'Protected');
      delete from applications where "type"='SAML';
      alter table applications
        alter column "type" type application_type_new
          using ("type"::text::application_type_new);
      drop type application_type;
      alter type application_type_new rename to application_type;

      create function check_application_type(
        application_id varchar(21),
        variadic target_type application_type[]
      ) returns boolean as
      $$ begin
        return (select type from applications where id = application_id) = any(target_type);
      end; $$ language plpgsql set search_path = public;

      alter table organization_application_relations
        add constraint application_type
        check (check_application_type(application_id, 'MachineToMachine'));

      alter table application_secrets
        add constraint application_type
        check (check_application_type(application_id, 'MachineToMachine', 'Traditional', 'Protected'));

      alter table sso_connector_idp_initiated_auth_configs
        add constraint application_type
        check (check_application_type(default_application_id, 'Traditional', 'SPA'));
    `);
  },
};

export default alteration;
