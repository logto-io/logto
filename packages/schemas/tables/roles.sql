/* init_order = 1 */

create type role_type as enum ('User', 'MachineToMachine');

create table roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(128) not null,
  description varchar(128) not null,
  type role_type not null default 'User',
  primary key (id),
  constraint roles__name
    unique (tenant_id, name)
);

create index roles__id
  on roles (tenant_id, id);

create function check_role_type(role_id varchar(21), target_type role_type) returns boolean as
$$ begin
  return (select type from roles where id = role_id) = target_type;
end; $$ language plpgsql;
