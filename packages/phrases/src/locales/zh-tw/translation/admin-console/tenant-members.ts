const tenant_members = {
  /** UNTRANSLATED */
  members: 'Members',
  /** UNTRANSLATED */
  invitations: 'Invitations',
  /** UNTRANSLATED */
  invite_member: 'Invite member',
  /** UNTRANSLATED */
  user: 'User',
  /** UNTRANSLATED */
  roles: 'Roles',
  /** UNTRANSLATED */
  admin: 'Admin',
  /** UNTRANSLATED */
  member: 'Member',
  /** UNTRANSLATED */
  invitation_status: 'Invitation status',
  /** UNTRANSLATED */
  invitation_sent: 'Invitation sent',
  /** UNTRANSLATED */
  expiration_date: 'Expiration date',
  invite_modal: {
    /** UNTRANSLATED */
    title: 'Invite people to Silverhand',
    /** UNTRANSLATED */
    subtitle: 'To invite members to an organization, they must accept the invitation.',
    /** UNTRANSLATED */
    to: 'To',
    /** UNTRANSLATED */
    added_as: 'Added as roles',
  },
  invitation_statuses: {
    /** UNTRANSLATED */
    pending: 'Pending',
    /** UNTRANSLATED */
    accepted: 'Accepted',
    /** UNTRANSLATED */
    expired: 'Expired',
    /** UNTRANSLATED */
    revoked: 'Revoked',
  },
  invitation_empty_placeholder: {
    /** UNTRANSLATED */
    title: 'Invite team members',
    /** UNTRANSLATED */
    description:
      'Your tenant currently has no members invited.\nTo assist with your integration, consider adding more members or admins.',
  },
  menu_options: {
    /** UNTRANSLATED */
    edit: 'Edit tenant role',
    /** UNTRANSLATED */
    delete: 'Remove user from tenant',
    /** UNTRANSLATED */
    resend_invite: 'Resend invitation',
    /** UNTRANSLATED */
    revoke: 'Revoke invitation',
    /** UNTRANSLATED */
    delete_invitation_record: 'Delete this invitation record',
  },
  edit_modal: {
    /** UNTRANSLATED */
    title: 'Change roles of {{name}}',
  },
  /** UNTRANSLATED */
  delete_user_confirm: 'Are you sure you want to remove this user from this tenant?',
  /** UNTRANSLATED */
  assign_admin_confirm:
    'Are you sure you want to make the selected user(s) admin? Granting admin access will give the user(s) the following permissions.<ul><li>Change the tenant billing plan</li><li>Add or remove collaborators</li><li>Delete the tenant</li></ul>',
  errors: {
    /** UNTRANSLATED */
    user_exists: 'This user is already in this organization',
    /** UNTRANSLATED */
    invalid_email: 'Email address is invalid. Please make sure it is in the right format.',
  },
};

export default Object.freeze(tenant_members);
