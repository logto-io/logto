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

-- Partial index for recent data to optimize billing cycle queries
create index daily_active_users__recent_date_covering
  on daily_active_users (date, tenant_id, user_id)
  where date >= (CURRENT_DATE - INTERVAL '90 days');

-- Keep the existing date index for backward compatibility
create index daily_active_users__date
  on daily_active_users (tenant_id, date);
