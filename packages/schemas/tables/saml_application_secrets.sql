/* init_order = 2 */

create table saml_application_secrets (
  id ${id_format} not null,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(36) not null
    references applications (id) on update cascade on delete cascade,
  private_key text not null,
  certificate text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  active boolean not null,
  primary key (tenant_id, application_id, id),
  constraint saml_application_secrets__application_type
    check (check_application_type(application_id, 'SAML'))
);

-- Only one active secret per application
create unique index saml_application_secrets__unique_active_secret
  on saml_application_secrets (tenant_id, application_id, active)
  where active;
