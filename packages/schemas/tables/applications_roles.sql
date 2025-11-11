/* init_order = 2 */

create table applications_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  application_id varchar(36) not null
    references applications (id) on update cascade on delete cascade,
  role_id ${id_format} not null
    references roles (id) on update cascade on delete cascade,
  primary key (id),
  constraint applications_roles__application_id_role_id
    unique (tenant_id, application_id, role_id),
  constraint applications_roles__role_type
    check (public.check_role_type(role_id, 'MachineToMachine'))
);

create index applications_roles__id
  on applications_roles (tenant_id, id);
