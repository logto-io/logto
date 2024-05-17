const organization_template = {
  title: 'Organization template',
  subtitle:
    'In multi-tenant SaaS applications, an organization template defines shared access control policies (permissions and roles) for multiple organizations.',
  roles: {
    tab_name: 'Organization roles',
    search_placeholder: 'Search by role name',
    create_title: 'Create organization role',
    role_column: 'Organization role',
    permissions_column: 'Permissions',
    placeholder_title: 'Organization role',
    placeholder_description:
      'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
    create_modal: {
      title: 'Create organization role',
      create: 'Create role',
      name_field: 'Role name',
      description_field: 'Description',
      created: 'Organization role {{name}} has been successfully created.',
    },
  },
  permissions: {
    tab_name: 'Organization permissions',
    search_placeholder: 'Search by permission name',
    create_org_permission: 'Create organization permission',
    permission_column: 'Organization permission',
    description_column: 'Description',
    placeholder_title: 'Organization permission',
    placeholder_description:
      'Organization permission refers to the authorization to access a resource in the context of organization.',
    delete_confirm:
      'If this permission is deleted, all organization roles including this permission will lose this permission, and users who had this permission will lose the access granted by it.',
    create_title: 'Create organization permission',
    edit_title: 'Edit organization permission',
    permission_field_name: 'Permission name',
    description_field_name: 'Description',
    description_field_placeholder: 'Read appointment history',
    create_permission: 'Create permission',
    created: 'The organization permission {{name}} has been successfully created.',
  },
};

export default Object.freeze(organization_template);
