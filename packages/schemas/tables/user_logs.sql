<<<<<<< HEAD
create type user_log_type as enum ('SignInUsernameAndPassword', 'ExchangeAccessToken');

create type user_log_result as enum ('Success', 'Failed');
=======
create type log_type as enum ('SignInUsernameAndPassword', 'ExchangeAccessToken');

create type log_result as enum ('Success', 'Failed');
>>>>>>> c554717 (fix(core): add log result type)

create table user_logs (
  id varchar(24) not null,
  user_id varchar(24) not null,
<<<<<<< HEAD
  type user_log_type not null,
  result user_log_result not null, /* not using boolean, may have more result types in the future */
=======
  type log_type not null,
  type log_result not null, /* not using boolean, may have more result types in the future */
>>>>>>> c554717 (fix(core): add log result type)
  payload jsonb /* @use UserLogPayload */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);
