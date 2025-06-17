/**
 * @fileoverview
 *
 * In the previous implementation, we used a JSONB field `users.identities` to store user social identities.
 * It allowed us to store multiple social identities for a user in a single field.
 * However, querying and indexing JSONB fields can be inefficient,
 *
 * In the alteration, we introduce a new table `user_social_identity_relations` to manually create user social identity relations.
 * This table is for indexing and joining purposes only,
 * always use `users.identities` as the source of truth for user social identities.
 * The `user_social_identity_relations` table will be automatically synced with the `users.identities` field using a trigger.
 * This allows us to efficiently query user social identities and their relations.
 */
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table if not exists user_social_identity_relations (
        tenant_id varchar(21) not null
          references tenants(id) on update cascade on delete cascade,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        target varchar(256) not null,
        identity_id varchar(128) not null,
        created_at timestamptz not null default (now()),
        primary key (tenant_id, user_id, target),
        constraint user_social_identity_ids__tenant_id__target__identity_id
          unique (tenant_id, target, identity_id)
      );
    `);

    await applyTableRls(pool, 'user_social_identity_relations');

    await pool.query(sql`
      create function sync_user_social_identity_relations()
      returns trigger as $$
      declare
        target_key text;
        identity_value jsonb;
        existing_targets text[];
      begin
        -- skip sync if this is an update and identities haven't changed
        if tg_op = 'UPDATE' and new.identities is not distinct from old.identities then
          return new;
        end if;

        -- extract all target keys from the new identities jsonb
        select array_agg(key) into existing_targets
        from jsonb_object_keys(new.identities) as key;

        -- delete entries for this user that no longer exist in the new identities
        delete from user_social_identity_relations
        where user_id = new.id
          and tenant_id = new.tenant_id
          and target not in (select * from unnest(existing_targets));

        -- upsert each identity entry
        for target_key, identity_value in
          select * from jsonb_each(new.identities)
        loop
          insert into user_social_identity_relations (
            tenant_id,
            user_id,
            target,
            identity_id
          )
          values (
            new.tenant_id,
            new.id,
            target_key,
            identity_value ->> 'userId'
          )
          -- update the identity_id if target already exists
          on conflict (tenant_id, user_id, target)
          do update set identity_id = excluded.identity_id;
        end loop;

        return new;
      end;
      $$ language plpgsql;
    `);

    await pool.query(sql`
      create trigger sync_user_social_identity_relations_trigger
        after insert or update of identities on users
        for each row
        execute procedure sync_user_social_identity_relations();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop trigger if exists sync_user_social_identity_relations_trigger on users;
    `);

    await pool.query(sql`
      drop function if exists sync_user_social_identity_relations() cascade;
    `);

    await dropTableRls(pool, 'user_social_identity_relations');

    await pool.query(sql`
      drop table if exists user_social_identity_relations;
    `);
  },
};

export default alteration;
