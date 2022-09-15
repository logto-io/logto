create table _logto_configs (
  key varchar(256) not null,
  value jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  primary key (key)
);
