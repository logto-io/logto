/** This table is used to store aggregated data of daily active users for each tenant. A daily job summarizes data from the daily active users table and inserts it into this table, or removes expired data. Therefore, we should not directly manipulate this table, except for "read" operations. */
create table aggregated_daily_active_users (
  tenant_id varchar(21) not null,
  activity_date date not null,
  user_id varchar(21) not null,
  activity_count integer not null,
  primary key (tenant_id, activity_date, user_id)
);

-- Index for billing cycle range queries
create index aggregated_daily_active_users__tenant_date
  on aggregated_daily_active_users (tenant_id, activity_date);

-- Index for tenant-specific user activity queries
create index aggregated_daily_active_users__tenant_user_date
  on aggregated_daily_active_users (tenant_id, user_id, activity_date desc);
