const role = {
  name_in_use: 'This role name {{name}} is already in use',
  scope_exists: 'The scope id {{scopeId}} has already been added to this role',
  management_api_scopes_not_assignable_to_user_role:
    'Cannot assign management API scopes to a user role.',
  user_exists: 'The user id {{userId}} is already been added to this role',
  application_exists: 'The application id {{applicationId}} is already been added to this role',
  default_role_missing:
    'Some of the default roleNames does not exist in database, please ensure to create roles first',
  internal_role_violation:
    'You may be trying to update or delete an internal role which is forbidden by Logto. If you are creating a new role, try another name that does not start with "#internal:".',
};

export default Object.freeze(role);
