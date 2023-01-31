const role_details = {
  back_to_roles: 'Back to Roles', // UNTRANSLATED
  identifier: 'Identifier', // UNTRANSLATED
  delete_description:
    'Doing so will remove the permissions associated with this role from the affected users and delete the mapping between roles, users, and permissions.', // UNTRANSLATED
  role_deleted: '{{name}} was successfully deleted!', // UNTRANSLATED
  settings_tab: 'Settings', // UNTRANSLATED
  users_tab: 'Users', // UNTRANSLATED
  permissions_tab: 'Permissions', // UNTRANSLATED
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Roles are a grouping of permissions that can be assigned to users. They also provide a way to aggregate permissions defined for different APIs, making it more efficient to add, remove, or adjust permissions compared to assigning them individually to users.', // UNTRANSLATED
  field_name: 'Name', // UNTRANSLATED
  field_description: 'Description', // UNTRANSLATED
  permission: {
    assign_button: 'Assign Permissions', // UNTRANSLATED
    assign_title: 'Assign permissions', // UNTRANSLATED
    assign_subtitle:
      'Assign permissions to this role. The role will gain the added permissions, and users with this role will inherit these permissions.', // UNTRANSLATED
    assign_form_field: 'Assign permissions', // UNTRANSLATED
    added_text_one: '{{count, number}} permission added', // UNTRANSLATED
    added_text_other: '{{count, number}} permissions added', // UNTRANSLATED
    api_permission_count_one: '{{count, number}} permission', // UNTRANSLATED
    api_permission_count_other: '{{count, number}} permissions', // UNTRANSLATED
    confirm_assign: 'Assign Permissions', // UNTRANSLATED
    permission_assigned: 'The selected permissions were successfully assigned to this role!', // UNTRANSLATED
    deletion_description:
      'If this permission is removed, the affected user with this role will lose the access granted by this permission.', // UNTRANSLATED
    permission_deleted: 'The permission "{{name}}" was successfully removed from this role!', // UNTRANSLATED
    empty: 'No permission available', // UNTRANSLATED
  },
  users: {
    assign_button: 'Assign Users', // UNTRANSLATED
    name_column: 'User', // UNTRANSLATED
    app_column: 'App', // UNTRANSLATED
    latest_sign_in_column: 'Latest sign in', // UNTRANSLATED
    delete_description:
      'It will remain in your user pool but lose the authorization for this role.', // UNTRANSLATED
    deleted: '{{name}} was successfully removed from this role!', // UNTRANSLATED
    assign_title: 'Assign users', // UNTRANSLATED
    assign_subtitle:
      'Assign users to this role. Find appropriate users by searching name, email, phone, or user ID.', // UNTRANSLATED
    assign_users_field: 'Assign users', // UNTRANSLATED
    confirm_assign: 'Assign users', // UNTRANSLATED
    users_assigned: 'The selected users were successfully assigned to this role!', // UNTRANSLATED
    empty: 'No user available', // UNTRANSLATED
  },
};

export default role_details;
