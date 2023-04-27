create table hooks (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(256),
  event varchar(128) /* @use HookEvent */, /* deprecated */
  events jsonb /* @use HookEvents */,
  config jsonb /* @use HookConfig */ not null,
  enabled boolean not null default true,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index hooks__id on hooks (tenant_id, id);

create index hooks__event on hooks (tenant_id, event);
