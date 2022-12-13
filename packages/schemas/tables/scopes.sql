create table scopes (
  id varchar(21) not null,
  resource_id varchar(21) references resources (id) on update cascade on delete cascade,
  name varchar(256) not null,
  description text,
  created_at timestamptz not null default(now()),
  primary key (id)
);
