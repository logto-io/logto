/* init_order = 2 */

create table user_sso_identities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  user_id ${id_format} not null references users (id) on update cascade on delete cascade,
  /** Unique provider identifier. Issuer of the OIDC connectors, entityId of the SAML providers */
  issuer varchar(256) not null,
  /** Provider user identity id*/
  identity_id varchar(128) not null,
  detail jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  /** Known issue: created_at uses timestamp instead of timestamptz */
  created_at timestamp not null default(now()),
  updated_at timestamptz not null default(now()),
  sso_connector_id
    varchar(128) not null
    references sso_connectors (id) on update cascade on delete cascade,
  primary key (id),
  constraint user_sso_identities__issuer__identity_id
    unique (tenant_id, issuer, identity_id)
);


create trigger set_updated_at
  before update on user_sso_identities
  for each row
  execute procedure set_updated_at();
