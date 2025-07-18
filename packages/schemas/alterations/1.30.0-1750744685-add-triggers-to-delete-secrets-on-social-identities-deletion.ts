import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    /** Trigger function to delete secret when the SSO identity is deleted. */
    await pool.query(sql`
      create function delete_secret_on_sso_identity_delete()
      returns trigger as $$
      begin
        delete from secrets
        where id in (
          select secret_id from secret_connector_relations
          where tenant_id = old.tenant_id
          and sso_connector_issuer = old.issuer
          and sso_identity_id = old.identity_id
        )
        -- we also need to ensure that the secret is associated with the correct user
        and user_id = old.user_id;
        return old;
      end;
      $$ language plpgsql;

      create trigger delete_secret_before_sso_identity_delete
        before delete on user_sso_identities
        for each row
        execute procedure delete_secret_on_sso_identity_delete();
    `);

    /** Trigger function to delete associated secrets when social identities are deleted. */
    await pool.query(sql`
      create function delete_secrets_on_social_identity_delete()
      returns trigger as $$
      declare
        target text;
        old_identity jsonb;
        new_identity jsonb;
      begin
        -- Loop over old identities to detect deletions or modifications
        for target in select jsonb_object_keys(old.identities)
        loop
          old_identity := old.identities -> target;
          new_identity := new.identities -> target;

          -- If the identity was deleted or modified, delete the associated secret
          if new_identity is null or (new_identity->>'userId') is distinct from (old_identity->>'userId') then
            -- Identity was removed or changed, delete the corresponding secrets
            delete from secrets
            using secret_connector_relations
            where secrets.id = secret_connector_relations.secret_id
            -- Ensure we are deleting the correct social identity
            and secret_connector_relations.social_connector_target = target
            and secret_connector_relations.social_identity_id = old_identity->>'userId'
            -- Ensure we delete the correct user's secret
            and secrets.user_id = old.id;
          end if;
        end loop;

        return new;
      end;
      $$ language plpgsql;

      create trigger delete_secrets_before_social_identity_delete
        before update of identities on users
        for each row
        execute procedure delete_secrets_on_social_identity_delete();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop trigger if exists delete_secret_before_sso_identity_delete on user_sso_identities;
      drop function if exists delete_secret_on_sso_identity_delete();

      drop trigger if exists delete_secrets_before_social_identity_delete on users;
      drop function if exists delete_secrets_on_social_identity_delete();
    `);
  },
};

export default alteration;
