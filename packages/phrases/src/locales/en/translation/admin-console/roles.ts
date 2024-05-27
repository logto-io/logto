const roles = {
  page_title: 'Roles',
  title: 'Roles',
  subtitle:
    'Roles include permissions that determine what a user can do. RBAC uses roles to give users access to resources for specific actions.',
  create: 'Create role',
  role_name: 'Role name',
  role_type: 'Role type',
  show_role_type_button_text: 'Show more options',
  hide_role_type_button_text: 'Hide more options',
  type_user: 'User role',
  type_machine_to_machine: 'Machine-to-machine app role',
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
  create_role_description:
    'Create and manage roles for your applications. Roles contain collections of permissions and can be assigned to users.',
  create_role_button: 'Create role',
  role_created: 'The role {{name}} has been successfully created.',
  search: 'Search by role name, description or ID',
  placeholder_title: 'Roles',
  placeholder_description:
    'Roles are a grouping of permissions that can be assigned to users. Be sure to add permission first before create roles.',
  assign_user_roles: 'Assign user roles',
  assign_m2m_roles: 'Assign machine-to-machine roles',
  management_api_access_notification:
    'For Logto Management API access, select roles with management API permissions <flag/>.',
  with_management_api_access_tip:
    'This machine-to-machine role includes Logto management API permissions',
};

export default Object.freeze(roles);
