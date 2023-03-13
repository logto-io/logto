create table hooks (
    tenant_id varchar(21) not null
      references tenants (id) on update cascade on delete cascade,
    id varchar(21) not null,
    event varchar(128) /* @use HookEvent */ not null,
    config jsonb /* @use HookConfig */ not null,
    created_at timestamptz not null default(now()),
    primary key (id)
  );

  create index hooks__id on hooks (tenant_id, id);

  create index hooks__event on hooks (tenant_id, event);
