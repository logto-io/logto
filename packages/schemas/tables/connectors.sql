create table connectors (
  id varchar(128) not null,
  name varchar(64) not null,
  platform varchar(64) not null,
  type varchar(64) not null,
  enabled boolean not null default FALSE,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  metadata jsonb /* @use ConnectorMetadata */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index connectors__name_platform on connectors (name, platform);
