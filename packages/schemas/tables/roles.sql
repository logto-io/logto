create table roles (
  id varchar(21) not null,
  name varchar(128) not null,
  description varchar(128) not null,
  primary key (id)
);

create unique index roles__name
on roles (
  name
);
