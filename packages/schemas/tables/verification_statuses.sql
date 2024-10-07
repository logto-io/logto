create table verification_statuses (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  created_at timestamptz not null default(now()),
  verified_identifier varchar(255),
  primary key (id)
);

create index verification_statuses__id
  on verification_statuses (tenant_id, id);

create index verification_statuses__user_id
  on verification_statuses (tenant_id, user_id);
