create table systems (
  key varchar(256) not null,
  value jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  primary key (key)
);

/* no_after_each */
