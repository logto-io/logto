const tenant_members = {
  /** UNTRANSLATED */
  members: 'Members',
  /** UNTRANSLATED */
  invitations: 'Invitations',
  /** UNTRANSLATED */
  invite_members: 'Invite members',
  /** UNTRANSLATED */
  user: 'User',
  /** UNTRANSLATED */
  roles: 'Roles',
  /** UNTRANSLATED */
  admin: 'Admin',
  /** UNTRANSLATED */
  collaborator: 'Collaborator',
  /** UNTRANSLATED */
  invitation_status: 'Invitation status',
  /** UNTRANSLATED */
  inviter: 'Inviter',
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
    /** UNTRANSLATED */
    email_input_placeholder: 'johndoe@example.com',
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
  /** UNTRANSLATED */
  revoke_invitation_confirm: 'Are you sure you want to revoke this invitation?',
  /** UNTRANSLATED */
  delete_invitation_confirm: 'Are you sure you want to delete this invitation record?',
  messages: {
    /** UNTRANSLATED */
    invitation_sent: 'Invitation sent.',
    /** UNTRANSLATED */
    invitation_revoked: 'Invitation revoked.',
    /** UNTRANSLATED */
    invitation_resend: 'Invitation resent.',
    /** UNTRANSLATED */
    invitation_deleted: 'Invitation record deleted.',
  },
  errors: {
    /** UNTRANSLATED */
    email_required: 'Invitee email is required.',
    /** UNTRANSLATED */
    email_exists: 'Email address already exists.',
    /** UNTRANSLATED */
    member_exists: 'This user is already a member of this organization.',
    /** UNTRANSLATED */
    pending_invitation_exists:
      'Pending invitation exists. Delete related email or revoke the invitation.',
    /** UNTRANSLATED */
    invalid_email: 'Email address is invalid. Please make sure it is in the right format.',
    /** UNTRANSLATED */
    max_member_limit: 'You have reached the maximum number of members ({{limit}}) for this tenant.',
  },
};

export default Object.freeze(tenant_members);
