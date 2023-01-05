create table roles_scopes (
  role_id varchar(21) not null references roles (id) on update cascade on delete cascade,
  scope_id varchar(21) not null references scopes (id) on update cascade on delete cascade,
  primary key (role_id, scope_id)
);
