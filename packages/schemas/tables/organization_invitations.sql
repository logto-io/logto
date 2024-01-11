/* init_order = 3 */

/** The invitation entry defined in RFC 0003. It stores the invitation information for a user to join an organization. */
create table organization_invitations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The unique identifier of the invitation. */
  id varchar(21) not null,
  /** The user ID who sent the invitation. */
  inviter_id varchar(21) not null,
  /** The email address or other identifier of the invitee. */
  invitee varchar(256) not null,
  /** The user ID of who accepted the invitation. */
  accepted_user_id varchar(21)
    references users (id) on update cascade on delete cascade,
  /** The ID of the organization to which the invitee is invited. */
  organization_id varchar(21) not null,
  /** The status of the invitation. */
  status varchar(32) /* @use OrganizationInvitationStatus */ not null,
  /** The ID of the magic link that can be used to accept the invitation. */
  magic_link_id varchar(21)
    references magic_links (id) on update cascade on delete cascade,
  /** The time when the invitation was created. */
  created_at timestamptz not null default (now()),
  /** The time when the invitation status was last updated. */
  updated_at timestamptz not null default (now()),
  /** The time when the invitation expires. */
  expires_at timestamptz not null,
  primary key (id),
  foreign key (tenant_id, inviter_id, organization_id)
    references organization_user_relations (tenant_id, user_id, organization_id)
    on update cascade on delete cascade
);
