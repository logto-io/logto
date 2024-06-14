/* init_order = 2 */

/** The email domains that will automatically assign users into an organization when they sign up or are added through the Management API. */
create table organization_jit_email_domains (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the organization. */
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  /** The email domain that will be automatically provisioned. */
  email_domain varchar(128) not null,
  primary key (tenant_id, organization_id, email_domain)
);
