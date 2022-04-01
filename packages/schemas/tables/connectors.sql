create type connector_type as enum ('Email', 'SMS', 'Social');

create table connectors (
  id varchar(128) not null,
  type connector_type not null,
  enabled boolean not null default TRUE,
  config jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);
