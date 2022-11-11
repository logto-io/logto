create table hooks (
  id varchar(128) not null,
  event varchar(128) not null,
  config jsonb /* @use HookConfig */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index hooks__event on hooks (event);
