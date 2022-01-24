create table connectors (
  id varchar(128) not null,
  enabled boolean not null default TRUE,
  config jsonb /* @use ConnectorConfig */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);
