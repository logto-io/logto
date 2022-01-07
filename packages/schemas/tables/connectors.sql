create type connector_type as enum ('SMS', 'Email', 'Social');

create table connectors (
  id varchar(128) not null,
  enabled boolean not null default TRUE,
  type connector_type not null,
  config jsonb /* @use ConnectorConfig */ not null default '{}'::jsonb,
  data jsonb /* @use ConnectorData */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id, type)
);
