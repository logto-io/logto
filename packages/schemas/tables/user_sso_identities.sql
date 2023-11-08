/* init_order = 2 */

create table user_sso_identities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(12) not null references users (id) on update cascade on delete cascade,
  /** Unique provider identifier. Issuer of the OIDC connectors, entityId of the SAML providers */
  issuer varchar(256) not null,
  /** Provider user identity id*/
  identity_id varchar(128) not null,
  detail jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  created_at timestamp not null default(now()),
  sso_connector_id
    varchar(128) not null
    references sso_connectors (id) on update cascade on delete cascade,
  primary key (id),
  constraint user_sso_identities__issuer__identity_id
    unique (tenant_id, issuer, identity_id)
);
