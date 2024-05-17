const organization_role_details = {
  page_title: 'Organization role details',
  back_to_org_roles: 'Back to organization roles',
  org_role: 'Organization role',
  delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  deleted: 'Organization role {{name}} was successfully deleted.',
  permissions: {
    tab: 'Permissions',
    name_column: 'Permission',
    description_column: 'Description',
    type_column: 'Permission type',
    type: {
      api: 'API permission',
      org: 'Organization permission',
    },
    assign_permissions: 'Assign permissions',
    remove_permission: 'Remove permission',
    remove_confirmation:
      'If this permission is removed, the user with this organization role will lose the access granted by this permission.',
    removed: 'The permission {{name}} was successfully removed from this organization role',
    assign_description:
      'Assign permissions to the roles within this organization. These can include both organization permissions and API permissions.',
    organization_permissions: 'Organization permissions',
    api_permissions: 'API permissions',
    assign_organization_permissions: 'Assign organization permissions',
    assign_api_permissions: 'Assign API permissions',
  },
  general: {
    tab: 'General',
    settings: 'Settings',
    description:
      'Organization role is a grouping of permissions that can be assigned to users. The permissions can come from the predefined organization permissions and API permission.',
    name_field: 'Name',
    description_field: 'Description',
    description_field_placeholder: 'Users with view-only permissions',
  },
};

export default Object.freeze(organization_role_details);
