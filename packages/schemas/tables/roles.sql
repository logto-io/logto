/* init_order = 1 */

create table roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(128) not null,
  description varchar(128) not null,
  primary key (id),
  constraint roles__name
    unique (tenant_id, name)
);

create index roles__id
  on roles (tenant_id, id);

create trigger set_tenant_id before insert on roles
  for each row execute procedure set_tenant_id();
