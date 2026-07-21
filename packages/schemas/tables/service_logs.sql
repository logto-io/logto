create table service_logs (
  id varchar(21) not null,
  tenant_id varchar(21) not null,
  type varchar(64) not null,
  payload jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index service_logs__id
  on service_logs (id);

create index service_logs__tenant_id__type__created_at
  on service_logs (tenant_id, type, created_at);

/* Global oldest-first scan for the age-based retention prune (the composite index above leads with
   `tenant_id`, so it can't drive a tenant-agnostic `created_at` range scan). */
create index service_logs__created_at
  on service_logs (created_at);

/* no_after_each */
