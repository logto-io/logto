create table settings (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  admin_console jsonb /* @use AdminConsoleConfig */ not null,
  primary key (id)
);

create index settings__id
  on settings (tenant_id, id);

create trigger set_tenant_id before insert on settings
  for each row execute procedure set_tenant_id();
