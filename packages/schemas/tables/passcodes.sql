create type passcode_type as enum ('SignIn', 'Register', 'ForgotPassword', 'Continue');

create table passcodes (
  id varchar(21) not null,
  interaction_jti varchar(128) not null,
  phone varchar(32),
  email varchar(128),
  type passcode_type not null,
  code varchar(6) not null,
  consumed boolean not null default FALSE,
  try_count int2 not null default 0,
  created_at timestamptz not null default(now()),
  primary key (id)
);
