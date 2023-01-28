create table logs (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  key varchar(128) not null,
  payload jsonb /* @use LogContextPayload */ not null default '{}'::jsonb,
  created_at timestamptz not null default (now()),
  primary key (id)
);

create index logs__id
  on logs (tenant_id, id);

create index logs__key
  on logs (tenant_id, key);

create index logs__user_id
  on logs (tenant_id, (payload->>'user_id') nulls last);

create index logs__application_id
  on logs (tenant_id, (payload->>'application_id') nulls last);

create trigger set_tenant_id before insert on logs
  for each row execute procedure set_tenant_id();
