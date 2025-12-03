create table daily_token_usage (
  id varchar(21) not null,
  tenant_id varchar(21) not null,
  usage bigint not null default(0),
  user_token_usage bigint not null default(0),
  m2m_token_usage bigint not null default(0),
  date timestamptz not null,
  primary key (id)
);

create unique index daily_token_usage__date
  on daily_token_usage (tenant_id, date);
