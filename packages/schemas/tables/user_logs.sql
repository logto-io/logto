create type log_type as enum ('SignInSuccess', 'SignInFailedWrongPassword', 'ExchangeAccessTokenSuccess');

create table user_logs (
  id varchar(24) not null,
  user_id varchar(24) not null,
  type log_type not null,
  payload jsonb /* @use UserLogPayload */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);
