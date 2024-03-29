const organization_template = {
  title: 'Organization template',
  subtitle:
    'In multi-tenant SaaS applications, it\'s common for multiple organizations to share identical access control policies, including permissions and roles. In Logto, this concept is termed "organization template." Using it streamlines the process of constructing and designing your authorization model.',
  org_roles: {
    tab_name: 'Org roles',
    search_placeholder: 'Search by role name',
    create_org_roles: 'Create org role',
    org_role_column: 'Org role',
    permissions_column: 'Permissions',
    placeholder_title: 'Organization role',
    placeholder_description:
      'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
  },
  org_permissions: {
    tab_name: 'Org permissions',
    search_placeholder: 'Search by permission name',
    create_org_permission: 'Create org permission',
    permission_column: 'Permission',
    description_column: 'Description',
    placeholder_title: 'Organization permission',
    placeholder_description:
      'Organization permission refers to the authorization to access a resource in the context of organization.',
    delete_confirm:
      'If this permission is deleted, all organization roles including this permission will lose this permission, and users who had this permission will lose the access granted by it.',
  },
};

export default Object.freeze(organization_template);
