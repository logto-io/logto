create table passcodes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  interaction_jti varchar(128),
  phone varchar(32),
  email varchar(128),
  type varchar(32) not null,
  code varchar(6) not null,
  consumed boolean not null default false,
  try_count int2 not null default 0,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index passcodes__id
  on passcodes (tenant_id, id);

create index passcodes__interaction_jti_type
  on passcodes (tenant_id, interaction_jti, type);

create index passcodes__email_type
  on passcodes (tenant_id, email, type);

create index passcodes__phone_type
  on passcodes (tenant_id, phone, type);
