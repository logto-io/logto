/* init_order = 2 */

/** The enterprise SSO connectors that will automatically assign users into an organization when they are authenticated via the SSO connector for the first time. */
create table organization_jit_sso_connectors (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the organization. */
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  sso_connector_id varchar(128) not null
    references sso_connectors (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_id, sso_connector_id)
);
