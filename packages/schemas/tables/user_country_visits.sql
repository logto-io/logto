/* init_order = 2 */

/** Tracks per-user country visits for adaptive MFA rules. */
create table user_country_visits (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(12) not null
    references users (id) on update cascade on delete cascade,
  /** ISO 3166-1 alpha-2 country code. */
  country varchar(2) not null,
  visited_at timestamptz not null default(now()),
  primary key (tenant_id, user_id, country)
);

create index user_country_visits__tenant_user_visited_at
  on user_country_visits (tenant_id, user_id, visited_at desc);
