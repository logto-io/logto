const tenant_members = {
  members: 'Members',
  invitations: 'Invitations',
  invite_members: 'Invite members',
  user: 'User',
  roles: 'Roles',
  admin: 'Admin',
  collaborator: 'Collaborator',
  invitation_status: 'Invitation status',
  inviter: 'Inviter',
  expiration_date: 'Expiration date',
  invite_modal: {
    title: 'Invite people to Logto Cloud',
    subtitle: 'To invite members to an organization, they must accept the invitation.',
    to: 'To',
    added_as: 'Added as roles',
    email_input_placeholder: 'johndoe@example.com',
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
  revoke_invitation_confirm: 'Are you sure you want to revoke this invitation?',
  delete_invitation_confirm: 'Are you sure you want to delete this invitation record?',
  messages: {
    invitation_sent: 'Invitation sent.',
    invitation_revoked: 'Invitation revoked.',
    invitation_resend: 'Invitation resent.',
    invitation_deleted: 'Invitation record deleted.',
  },
  errors: {
    email_required: 'Invitee email is required.',
    email_exists: 'Email address already exists.',
    member_exists: 'This user is already a member of this organization.',
    pending_invitation_exists:
      'Pending invitation exists. Delete related email or revoke the invitation.',
    invalid_email: 'Email address is invalid. Please make sure it is in the right format.',
    max_member_limit: 'You have reached the maximum number of members ({{limit}}) for this tenant.',
  },
};

export default Object.freeze(tenant_members);
