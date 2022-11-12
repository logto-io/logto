create type hook_event_type as enum ('PostSignIn', 'PostSignOut', 'PostChangePassword');

create table hooks (
  id varchar(128) not null,
  event hook_event_type not null,
  config jsonb /* @use HookConfig */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index hooks__event on hooks (event);
