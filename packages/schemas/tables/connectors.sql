create table connectors (
  tenant_id varchar(21) not null 
    references tenants (id) on update cascade on delete cascade,
  id varchar(128) not null,
  sync_profile boolean not null default FALSE,
  connector_id varchar(128) not null,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  metadata jsonb /* @use ConfigurableConnectorMetadata */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index connectors__id
  on connectors (tenant_id, id);
