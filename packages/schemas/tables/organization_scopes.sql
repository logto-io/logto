/* init_order = 1 */

/** The scopes (permissions) defined by the organization template. */
create table organization_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization scope. */
  id varchar(36) not null,
  /** The organization scope's name, unique within the organization template. */
  name varchar(128) not null,
  /** A brief description of the organization scope. */
  description varchar(256),
  primary key (id),
  constraint organization_scopes__name
    unique (tenant_id, name)
);

create index organization_scopes__id
  on organization_scopes (tenant_id, id);
