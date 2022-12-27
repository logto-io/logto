create table passcodes (
  id varchar(21) not null,
  interaction_jti varchar(128) not null,
  phone varchar(32),
  email varchar(128),
  type varchar(32) not null,
  code varchar(6) not null,
  consumed boolean not null default FALSE,
  try_count int2 not null default 0,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index passcodes__interaction_jti_type
on passcodes (
  interaction_jti,
  type
);
