create table connectors (
  id varchar(128) not null,
  enabled boolean not null default FALSE,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);
