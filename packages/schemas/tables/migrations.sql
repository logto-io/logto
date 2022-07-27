create table _migrations (
  id varchar(128) not null,
  name varchar(256) not null unique,
  checksum varchar(64) not null,
  started_at timestamptz not null default(now()),
  finished_at timestamptz,
  rolled_back_at timestamptz,
  log text,
  primary key (id)
);
