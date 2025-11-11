/* init_order = 1 */

create table resources (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(36) not null,
  name text not null,
  indicator text not null, /* resource indicator also used as audience */
  is_default boolean not null default (false),
  access_token_ttl bigint not null default(3600), /* expiration value in seconds, default is 1h */
  primary key (id),
  constraint resources__indicator
    unique (tenant_id, indicator)
);

create index resources__id
  on resources (tenant_id, id);

create unique index resources__is_default_true
  on resources (tenant_id)
  where is_default = true;
