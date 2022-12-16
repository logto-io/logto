create table users_roles (
  user_id varchar(21) not null references users (id) on update cascade on delete cascade,
  role_id varchar(21) not null references roles (id) on update cascade on delete cascade,
  primary key (user_id, role_id)
);
