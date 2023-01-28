create table users_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  role_id varchar(21) not null
    references roles (id) on update cascade on delete cascade,
  primary key (id),
  constraint users_roles__user_id_role_id
    unique (tenant_id, user_id, role_id)
);

create index users_roles__id
  on users_roles (tenant_id, id);
