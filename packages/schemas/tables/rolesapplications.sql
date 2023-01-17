create table applications_roles (
  application_id varchar(21) not null references applications (id) on update cascade on delete cascade,
  role_id varchar(21) not null references roles (id) on update cascade on delete cascade,
  primary key (application_id, role_id)
);
