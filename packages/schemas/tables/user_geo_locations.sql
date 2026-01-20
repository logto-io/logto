/* init_order = 2 */

/** The last known geo coordinates per user for geo-velocity checks. */
create table user_geo_locations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(12) not null
    references users (id) on update cascade on delete cascade,
  latitude numeric(9,6),
  longitude numeric(9,6),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id),
  check ((latitude is null) = (longitude is null))
);
