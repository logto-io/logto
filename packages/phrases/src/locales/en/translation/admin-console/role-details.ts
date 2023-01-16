const role_details = {
  back_to_roles: 'Back to Roles', // UNTRANSLATED
  identifier: 'Identifier', // UNTRANSLATED
  delete_description:
    'Doing so will remove the permissions associated with this role from the affected users and delete the mapping between roles, users, and permissions.',
  role_deleted: '{{name}} was successfully deleted!',
  settings_tab: 'Settings', // UNTRANSLATED
  users_tab: 'Users', // UNTRANSLATED
  permissions_tab: 'Permissions', // UNTRANSLATED
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Roles are a grouping of permissions that can be assigned to users. They also provide a way to aggregate permissions defined for different APIs, making it more efficient to add, remove, or adjust permissions compared to assigning them individually to users.',
  field_name: 'Name', // UNTRANSLATED
  field_description: 'Description', // UNTRANSLATED
  permission: {
    assign_button: 'Assign Permission',
    assign_title: 'Assign permission',
    assign_subtitle:
      'Assign permissions to this role. The role will gain the added permissions, and users with this role will inherit these permissions.',
    assign_form_filed: 'Assign permissions',
    added_text: '{{value, number}} permissions added',
    api_permission_count: '{{value, number}} permissions',
    confirm_assign: 'Assign Permission',
    permission_assigned: 'The selected permissions were successfully assigned to this role!',
    deletion_description:
      'If this permission is deleted, the affected user with this role will lose the access granted by this permission.',
    permission_deleted: 'The permission "{{name}}" was successfully removed from this role!',
    empty: 'No permission available',
  },
  users: {
    assign_button: 'Assign Users',
    name_column: 'User',
    app_column: 'App',
    latest_sign_in_column: 'Latest sign in',
    delete_description:
      'It will remain in your user pool but lose the authorization for this role.',
    deleted: '{{name}} was successfully removed from this role!', // UNTRANSLATED
    assign_title: 'Assign users',
    assign_subtitle:
      'Assign users to this role. Find appropriate users by searching name, email, phone, or user ID.',
    assign_users_field: 'Assign users',
    confirm_assign: 'Assign users',
    users_assigned: 'The selected users were successfully assigned to this role!',
    empty: 'No user available',
  },
};

export default role_details;
