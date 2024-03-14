const tenant_members = {
  members: 'Members',
  invitations: 'Invitations',
  invite_member: 'Invite member',
  user: 'User',
  roles: 'Roles',
  admin: 'Admin',
  member: 'Member',
  invitation_status: 'Invitation status',
  invitation_sent: 'Invitation sent',
  expiration_date: 'Expiration date',
  invite_modal: {
    title: 'Invite people to Silverhand',
    subtitle: 'To invite members to an organization, they must accept the invitation.',
    to: 'To',
    added_as: 'Added as roles',
  },
  invitation_statuses: {
    pending: 'Pending',
    accepted: 'Accepted',
    expired: 'Expired',
    revoked: 'Revoked',
  },
  invitation_empty_placeholder: {
    title: 'Invite team members',
    description:
      'Your tenant currently has no members invited.\nTo assist with your integration, consider adding more members or admins.',
  },
  menu_options: {
    edit: 'Edit tenant role',
    delete: 'Remove user from tenant',
    resend_invite: 'Resend invitation',
    revoke: 'Revoke invitation',
    delete_invitation_record: 'Delete this invitation record',
  },
  edit_modal: {
    title: 'Change roles of {{name}}',
  },
  delete_user_confirm: 'Are you sure you want to remove this user from this tenant?',
  assign_admin_confirm:
    'Are you sure you want to make the selected user(s) admin? Granting admin access will give the user(s) the following permissions.<ul><li>Change the tenant billing plan</li><li>Add or remove collaborators</li><li>Delete the tenant</li></ul>',
  errors: {
    user_exists: 'This user is already in this organization',
    invalid_email: 'Email address is invalid. Please make sure it is in the right format.',
  },
};

export default Object.freeze(tenant_members);
