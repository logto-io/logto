create table hooks (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(256) not null,
  events jsonb /* @use HookEvents */ not null,
  config jsonb /* @use HookConfig */ not null,
  enabled boolean not null default true,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index hooks__id on hooks (tenant_id, id);
