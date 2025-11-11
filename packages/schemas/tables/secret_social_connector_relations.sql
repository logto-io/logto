/* init_order = 3 */

create table secret_social_connector_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  secret_id ${id_format} not null
    references secrets (id) on update cascade on delete cascade,
  /** Social connector ID foreign reference. Only present for secrets that store social connector tokens. Note: avoid directly cascading deletes here, need to delete the secrets first.*/
  connector_id varchar(128) not null
    references connectors (id) on update cascade,
  /** The target of the social connector. e.g. 'github', 'google', etc. */
  target varchar(256) not null,
  /** User social identity ID foreign reference. Only present for secrets that store social identity tokens. */
  identity_id varchar(128) not null,
  primary key (tenant_id, secret_id),
  /** Ensures that each social identity is associated with only one secret. */
  constraint secret_social_connector_relations__target__identity_id
    unique (tenant_id, target, identity_id)
);

/** Trigger function to delete secrets when the social connector is deleted. */
create function delete_secrets_on_social_connector_delete()
returns trigger as $$
begin
  delete from secrets
  where id in (
    select secret_id from secret_social_connector_relations
    where tenant_id = old.tenant_id and connector_id = old.id
  );
  return old;
end;
$$ language plpgsql;

create trigger delete_secrets_before_social_connector_delete
  before delete on connectors
  for each row
  execute procedure delete_secrets_on_social_connector_delete();


/** Trigger function to delete associated secrets when social identities are deleted. */
create function delete_secrets_on_social_identity_delete()
returns trigger as $$
declare
  identity_target text;
  old_identity jsonb;
  new_identity jsonb;
begin
  -- Loop over old identities to detect deletions or modifications
  for identity_target in select jsonb_object_keys(old.identities)
  loop
    old_identity := old.identities -> identity_target;
    new_identity := new.identities -> identity_target;

    -- If the identity was deleted or modified, delete the associated secret
    if new_identity is null or (new_identity->>'userId') is distinct from (old_identity->>'userId') then
      -- Identity was removed or changed, delete the corresponding secrets
      delete from secrets
      using secret_social_connector_relations
      where secrets.id = secret_social_connector_relations.secret_id
      -- Ensure we are deleting the correct social identity
      and secret_social_connector_relations.target = identity_target
      and secret_social_connector_relations.identity_id = old_identity->>'userId'
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
