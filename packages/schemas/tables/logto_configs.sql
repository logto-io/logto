create table logto_configs (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  key varchar(256) not null,
  value jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  primary key (tenant_id, key)
);
