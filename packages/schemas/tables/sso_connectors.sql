create table sso_connectors (
  tenant_id varchar(21) not null 
    references tenants (id) on update cascade on delete cascade,
  id varchar(128) not null,
  provider_type varchar(128) not null,
  connector_name varchar(128) not null,
  config jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  domains jsonb /* @use SsoDomains */ not null default '[]'::jsonb,
  branding jsonb /* @use SsoBranding */ not null default '{}'::jsonb,
  sync_profile boolean not null default FALSE,
  sso_only boolean not null default FALSE,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index sso_connectors__id
  on sso_connectors (tenant_id, id);

create index sso_connectors__id__provider_name
  on sso_connectors (tenant_id, id, provider_name);
