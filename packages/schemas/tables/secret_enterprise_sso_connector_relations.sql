/* init_order = 3 */

create table secret_enterprise_sso_connector_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  secret_id ${id_format} not null
    references secrets (id) on update cascade on delete cascade,
  /** SSO connector ID foreign reference. Only present for secrets that store SSO connector tokens. Note: avoid directly cascading deletes here, need to delete the secrets first.*/
  sso_connector_id varchar(128) not null
    references sso_connectors (id) on update cascade,
  /** User SSO connector issuer. Only present for secrets that store SSO connector tokens. */
  issuer varchar(256) not null,
  /** User SSO identity ID. Only present for secrets that store SSO identity tokens. */
  identity_id varchar(128) not null,
  primary key (tenant_id, secret_id),
  /** Ensures that each SSO identity is associated with only one secret. */
  foreign key (tenant_id, issuer, identity_id)
    references user_sso_identities (tenant_id, issuer, identity_id) on update cascade
);

/** Trigger function to delete secrets when the SSO connector is deleted. */
create function delete_secrets_on_sso_connector_delete()
returns trigger as $$
begin
  delete from secrets
  where id in (
    select secret_id from secret_enterprise_sso_connector_relations
    where tenant_id = old.tenant_id and sso_connector_id = old.id
  );
  return old;
end;
$$ language plpgsql;

create trigger delete_secrets_before_sso_connector_delete
  before delete on sso_connectors
  for each row
  execute procedure delete_secrets_on_sso_connector_delete();


/** Trigger function to delete secret when the SSO identity is deleted. */
create function delete_secret_on_sso_identity_delete()
returns trigger as $$
begin
  delete from secrets
  where id in (
    select secret_id from secret_enterprise_sso_connector_relations
    where tenant_id = old.tenant_id
    and issuer = old.issuer
    and identity_id = old.identity_id
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
