/* init_order = 2 */

create table user_social_identity_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  /** Unique social provider identifier. E.g., 'google', 'facebook', etc. */
  target varchar(256) not null,
  /** Unique identifier for the user in the social provider. */
  identity_id varchar(128) not null,
  created_at timestamptz not null default (now()),
  primary key (tenant_id, user_id, target),
  constraint user_social_identity_ids__tenant_id__target__identity_id
    unique (tenant_id, target, identity_id)
);

/**
 * Trigger function to sync user social identity relations after identities are updated.
 * This will ensure that the `user_social_identity_relations` table is kept in sync
 * with the identities field in the `users` table.
 * 
 * It handles both insertions and updates to the `identities` field.
 * - for new identities, it inserts new records into the `user_social_identity_relations` table.
 * - for existing identities, it updates the `identity_id` if the target already exists.
 * - for identities that no longer exist in the `identities` field, it deletes the corresponding records
 */
create function sync_user_social_identity_relations()
returns trigger as $$
declare
  target_key text;
  identity_value jsonb;
  existing_targets text[];
begin
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


create trigger sync_user_social_identity_relations_trigger
  after insert or update of identities on users
  for each row
  execute procedure sync_user_social_identity_relations();
