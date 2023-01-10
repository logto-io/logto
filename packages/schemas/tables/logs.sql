create table logs
(
  id varchar(21) not null,
  key varchar(128) not null,
  payload jsonb /* @use LogContextPayload */ not null default '{}'::jsonb,
  created_at timestamptz not null default (now()),
  primary key (id)
);

create index logs__key on logs (key);
create index logs__created_at on logs (created_at);
create index logs__user_id on logs ((payload->>'user_id') nulls last);
create index logs__application_id on logs ((payload->>'application_id') nulls last);
