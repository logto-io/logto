const organization_role_details = {
  page_title: 'Organization role details',
  back_to_org_roles: 'Back to org roles',
  org_role: 'Organization role',
  delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  deleted: 'Org role {{name}} was successfully deleted.',
  permissions: {
    tab: 'Permissions',
    name_column: 'Permission',
    description_column: 'Description',
    type_column: 'Permission type',
    type: {
      api: 'API permission',
      org: 'Org permission',
    },
    assign_permissions: 'Assign permissions',
  },
  general: {
    tab: 'General',
    settings: 'Settings',
    description:
      'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
    name_field: 'Name',
    description_field: 'Description',
    description_field_placeholder: 'Users with view-only permissions',
  },
};

export default Object.freeze(organization_role_details);
