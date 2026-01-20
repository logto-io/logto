/* init_order = 2 */

/** Tracks per-user sign-in countries for adaptive MFA rules. */
create table user_sign_in_countries (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(12) not null
    references users (id) on update cascade on delete cascade,
  /** ISO 3166-1 alpha-2 country code. */
  country varchar(2) not null,
  last_sign_in_at timestamptz not null default(now()),
  primary key (tenant_id, user_id, country)
);

create index user_sign_in_countries__tenant_user_last_sign_in_at
  on user_sign_in_countries (tenant_id, user_id, last_sign_in_at desc);
