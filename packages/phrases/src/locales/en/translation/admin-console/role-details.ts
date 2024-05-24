const role_details = {
  back_to_roles: 'Back to roles',
  identifier: 'Identifier',
  delete_description:
    'Doing so will remove the permissions associated with this role from the affected users and delete the mapping between roles, users, and permissions.',
  role_deleted: '{{name}} was successfully deleted.',
  general_tab: 'General',
  users_tab: 'Users',
  m2m_apps_tab: 'Machine-to-machine apps',
  permissions_tab: 'Permissions',
  settings: 'Settings',
  settings_description:
    'Roles are a grouping of permissions that can be assigned to users. They also provide a way to aggregate permissions defined for different APIs, making it more efficient to add, remove, or adjust permissions compared to assigning them individually to users.',
  field_name: 'Name',
  field_description: 'Description',
  field_is_default: 'Default role',
  field_is_default_description:
    'Set this role as a default role for new users. Multiple default roles can be set. This will also affect the default roles for users created via Management API.',
  type_m2m_role_tag: 'Machine-to-machine app role',
  type_user_role_tag: 'User role',
  m2m_role_notification:
    'Assign this machine-to-machine role to a machine-to-machine app to grant access to the relative API resources. <a>Create a machine-to-machine app</a> first if you haven’t already.',
  permission: {
    assign_button: 'Assign permissions',
    assign_title: 'Assign permissions',
    assign_subtitle:
      'Assign permissions to this role. The role will gain the added permissions, and users with this role will inherit these permissions.',
    assign_form_field: 'Assign permissions',
    added_text_one: '{{count, number}} permission added',
    added_text_other: '{{count, number}} permissions added',
    api_permission_count_one: '{{count, number}} permission',
    api_permission_count_other: '{{count, number}} permissions',
    confirm_assign: 'Assign permissions',
    permission_assigned: 'The selected permissions were successfully assigned to this role',
    deletion_description:
      'If this permission is removed, the affected user with this role will lose the access granted by this permission.',
    permission_deleted: 'The permission "{{name}}" was successfully removed from this role',
    empty: 'No permission available',
  },
  users: {
    assign_button: 'Assign users',
    name_column: 'User',
    app_column: 'App',
    latest_sign_in_column: 'Latest sign in',
    delete_description:
      'It will remain in your user pool but lose the authorization for this role.',
    deleted: '{{name}} was successfully removed from this role',
    assign_title: 'Assign users',
    assign_subtitle:
      'Assign users to this role. Find appropriate users by searching name, email, phone, or user ID.',
    assign_field: 'Assign users',
    confirm_assign: 'Assign users',
    assigned_toast_text: 'The selected users were successfully assigned to this role',
    empty: 'No user available',
  },
  applications: {
    assign_button: 'Assign applications',
    name_column: 'Application',
    app_column: 'Apps',
    description_column: 'Description',
    delete_description:
      'It will remain in your application pool but lose the authorization for this role.',
    deleted: '{{name}} was successfully removed from this role',
    assign_title: 'Assign apps',
    assign_subtitle:
      'Assign applications to this role. Find appropriate applications by searching name, description or app ID.',
    assign_field: 'Assign applications',
    confirm_assign: 'Assign applications',
    assigned_toast_text: 'The selected applications were successfully assigned to this role',
    empty: 'No application available',
  },
};

export default Object.freeze(role_details);
