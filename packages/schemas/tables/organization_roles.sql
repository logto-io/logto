/* init_order = 1 */

/** The roles defined by the organization template. */
create table organization_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization role. */
  id varchar(21) not null,
  /** The organization role's name, unique within the organization template. */
  name varchar(128) not null,
  /** A brief description of the organization role. */
  description varchar(256),
  primary key (id),
  constraint organization_roles__name
    unique (tenant_id, name)
);

create index organization_roles__id
  on organization_roles (tenant_id, id);
