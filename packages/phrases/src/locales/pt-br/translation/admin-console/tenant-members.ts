const tenant_members = {
  /** UNTRANSLATED */
  members: 'Members',
  /** UNTRANSLATED */
  invitations: 'Invitations',
  /** UNTRANSLATED */
  new_member: 'New member',
  /** UNTRANSLATED */
  user: 'User',
  /** UNTRANSLATED */
  roles: 'Roles',
  /** UNTRANSLATED */
  admin: 'Admin',
  /** UNTRANSLATED */
  member: 'Member',
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
  user_options: {
    /** UNTRANSLATED */
    edit: 'Edit tenant role',
    /** UNTRANSLATED */
    delete: 'Remove user from tenant',
  },
  edit_modal: {
    /** UNTRANSLATED */
    title: 'Change roles of {{name}}',
  },
  /** UNTRANSLATED */
  leave_tenant_confirm: 'Are you sure you want to leave this tenant?',
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
