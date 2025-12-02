create table daily_active_users (
  id varchar(21) not null,
  tenant_id varchar(21) not null,
  user_id varchar(21) not null,
  date timestamptz not null default (now()),
  primary key (id),
  constraint daily_active_users__user_id_date
    unique (user_id, date)
);

-- Optimized index for aggregation queries with better write performance
create index daily_active_users__tenant_date_user
  on daily_active_users (tenant_id, date, user_id);

-- BRIN index for time-series date range queries
-- Optimized for sequential data insertion and range scans (date >= ?)
create index daily_active_users__date_brin
  on daily_active_users using brin (date);

create index daily_active_users__date
  on daily_active_users (tenant_id, date);
