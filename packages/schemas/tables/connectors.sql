create table connectors (
  id varchar(128) not null,
  enabled boolean not null default FALSE,
  sync_profile boolean not null default FALSE,
  connector_id varchar(128) not null,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  metadata jsonb /* @use ConfigurableConnectorMetadata */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);
