/* init_order = 1 */

/** Configuration for ID format used by each tenant. */
create table tenant_id_config (
  tenant_id varchar(21) not null primary key
    references tenants (id) on update cascade on delete cascade,
  /** ID format for all entity IDs ('nanoid' or 'uuidv7'). */
  id_format varchar(10) not null default 'nanoid',
  /** When the configuration was created. */
  created_at timestamptz not null default(now()),
  /** When the configuration was last updated. */
  updated_at timestamptz not null default(now())
);

create index tenant_id_config__tenant_id
  on tenant_id_config (tenant_id);

