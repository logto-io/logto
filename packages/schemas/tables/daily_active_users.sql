create table daily_active_users (
  id varchar(21) not null,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(21) not null,
  date timestamptz not null default (now()),
  primary key (id),
  constraint daily_active_users__user_id_date
    unique (user_id, date)
);

create index daily_active_users__id
  on daily_active_users (tenant_id, id);

create index daily_active_users__tenant_date_idx
  on daily_active_users (tenant_id, date);
