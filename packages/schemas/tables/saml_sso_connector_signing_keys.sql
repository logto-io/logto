/* init_order = 2 */

create table saml_sso_connector_signing_keys (
  id varchar(21) not null,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  sso_connector_id varchar(128) not null
    references sso_connectors (id) on update cascade on delete cascade,
  /** The SP private key (plaintext PEM) used to sign the SAML AuthnRequest. Tenant-isolated by RLS and never returned by the API. */
  private_key text not null,
  /** The PEM-encoded self-signed SP certificate matching the private key. Public and safe to expose. */
  certificate text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  active boolean not null,
  primary key (tenant_id, sso_connector_id, id)
);

create unique index saml_sso_connector_signing_keys__unique_active
  on saml_sso_connector_signing_keys (tenant_id, sso_connector_id, active)
  where active;
