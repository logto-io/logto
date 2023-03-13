create table service_logs (
  id varchar(21) not null,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  type varchar(64) not null,
  payload jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index service_logs__id
  on service_logs (id);

create index service_logs__tenant_id__type
  on service_logs (tenant_id, type);

/* no_after_each */
