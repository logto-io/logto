create table daily_token_usage (
  id ${id_format} not null,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  usage bigint not null default(0),
  date timestamptz not null,
  primary key (id)
);

create unique index daily_token_usage__date
  on daily_token_usage (tenant_id, date);
