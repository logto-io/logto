/* init_order = 1 */

create table user_sso_identities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(12) not null references users (id) on update cascade on delete cascade,
  /** Unique provider identifier. Issuer of the OIDC connectors, entityId of the SAML providers */
  issuer varchar(256) not null,
  identity_id varchar(128) not null,
  detail jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  primary key (tenant_id, issuer, identity_id)
);
