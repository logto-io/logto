create table roles_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  role_id ${id_format} not null
    references roles (id) on update cascade on delete cascade,
  scope_id varchar(36) not null
    references scopes (id) on update cascade on delete cascade,
  primary key (id),
  constraint roles_scopes__role_id_scope_id
    unique (tenant_id, role_id, scope_id)
);

create index roles_scopes__id
  on roles_scopes (tenant_id, id);
