/* init_order = 4 */

/** The organization roles that will be assigned to a user when they accept an invitation. */
create table organization_invitation_role_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the invitation. */
  organization_invitation_id ${id_format} not null
    references organization_invitations (id) on update cascade on delete cascade,
  /** The ID of the organization role. */
  organization_role_id ${id_format} not null
    references organization_roles (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_invitation_id, organization_role_id)
);
