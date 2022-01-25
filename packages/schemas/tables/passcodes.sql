create type passcode_type as enum ('SignIn', 'Register', 'ForgotPassword');

create table passcodes (
  id varchar(128) not null,
  session_id varchar(128) not null,
  phone varchar(32),
  email varchar(128),
  type passcode_type not null,
  code varchar(6) not null,
  used boolean not null default TRUE,
  try_count int2 not null default 0,
  created_at timestamptz not null default(now()),
  primary key (id)
);
