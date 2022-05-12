create table connectors (
  id varchar(128) not null,
  target varchar(64) not null,
  platform varchar(64),
  enabled boolean not null default FALSE,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index connectors__name_platform on connectors (target, platform);
