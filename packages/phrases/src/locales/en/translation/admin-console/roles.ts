const roles = {
  page_title: 'Roles',
  title: 'Roles',
  subtitle:
    'Roles include permissions that determine what a user can do. RBAC uses roles to give users access to resources for specific actions.',
  create: 'Create role',
  role_name: 'Role name',
  role_type: 'Role type',
  type_user: 'User',
  type_machine_to_machine: 'Machine-to-machine',
  role_description: 'Description',
  role_name_placeholder: 'Enter your role name',
  role_description_placeholder: 'Enter your role description',
  col_roles: 'Roles',
  col_type: 'Type',
  col_description: 'Description',
  col_assigned_entities: 'Assigned',
  user_counts: '{{count}} users',
  application_counts: '{{count}} apps',
  user_count: '{{count}} user',
  application_count: '{{count}} app',
  assign_permissions: 'Assign permissions',
  create_role_title: 'Create role',
  create_role_description: 'Use roles to organize permissions and assign them to users.',
  create_role_button: 'Create role',
  role_created: 'The role {{name}} has been successfully created.',
  search: 'Search by role name, description or ID',
  placeholder_title: 'Roles',
  placeholder_description:
    'Roles are a grouping of permissions that can be assigned to users. Be sure to add permission first before create roles.',
  assign_roles: 'Assign roles',
  management_api_access_notification:
    'For Logto Management API access, select roles with Management API permissions <flag/>.',
  with_management_api_access_tip:
    'This machine-to-machine role includes Logto Management API permissions',
  role_creation_hint: 'Can’t find the right role? <a>Create a role</a>',
};

export default Object.freeze(roles);
