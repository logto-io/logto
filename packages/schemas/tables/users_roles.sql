/* init_order = 2 */

create table users_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  user_id ${id_format} not null
    references users (id) on update cascade on delete cascade,
  role_id ${id_format} not null
    references roles (id) on update cascade on delete cascade,
  primary key (id),
  constraint users_roles__user_id_role_id
    unique (tenant_id, user_id, role_id),
  constraint users_roles__role_type
    check (public.check_role_type(role_id, 'User'))
);

create index users_roles__id
  on users_roles (tenant_id, id);
