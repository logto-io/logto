create type user_log_type as enum ('SignInUsernameAndPassword', 'SignInEmail', 'SignInPhone', 'SignInSocial', 'RegisterUsernameAndPassword', 'RegisterEmail', 'RegisterPhone', 'RegisterSocial', 'ForgotPasswordEmail', 'ForgotPasswordPhone', 'ExchangeAccessToken');

create type user_log_result as enum ('Success', 'Failed');

create table user_logs (
  id varchar(24) not null,
  user_id varchar(24) not null,
  type user_log_type not null,
  result user_log_result not null, /* not using boolean, may have more result types in the future */
  payload jsonb /* @use UserLogPayload */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);
