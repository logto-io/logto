const organization = {
  page_title: 'Organizations',
  title: 'Organizations',
  subtitle:
    'Represent the teams, business customers, and partner companies that access your applications as organizations.',
  create_organization: 'Create organization',
  organization_name_placeholder: 'My organization',
  organization_description_placeholder: 'A brief description of the organization.',
  access_control: 'Access control',
  access_control_description:
    'Authorization in a multi-tenancy applications is often designed to make sure that tenant isolation is maintained throughout an application and that tenants can access only their own resources.',
  organization_permission: 'Organization permission',
  organization_permission_other: 'Organization permissions',
  organization_permission_delete_confirm:
    'If this permission is deleted, all organization roles including this permission will lose this permission, and users who had this permission will lose the access granted by it.',
  create_permission_placeholder: 'Read appointment history.',
  permission: 'Permission',
  permission_other: 'Permissions',
  organization_role: 'Organization role',
  organization_role_other: 'Organization roles',
  organization_role_delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  role: 'Role',
  create_role_placeholder: 'Users with view-only permissions.',
  search_permission_placeholder: 'Type to search for permissions',
  guide: {
    title: 'Start with guides',
    subtitle: 'Jumpstart your app development process with our guides',
    brief_title: "First, let's understand how organizations works in Logto",
    brief_introduction:
      "In a multi-tenant app, it's important to set clear authorization rules to keep each tenant's data separate. Think of each tenant of your product as its own Logto organization, and they should naturally share the same access control template by default. <a>Learn more</a>",
    step_1: 'Step 1: Define organization permissions',
    step_2: 'Step 2: Define organization roles',
    step_2_description:
      '"Organization roles" represent a set of roles given to each organization at the start. These roles are determined by the global permissions you have set in previous screen. Similar with org permission, once you finish this setting for the first time, you won’t need to do this every-time you create a new organization.',
    step_3: 'Step 3: Create your first organization',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    more_next_steps: 'More next steps',
    add_members: 'Add members to your organization',
    add_members_action: 'Bulk add members and assign roles',
    add_enterprise_connector: 'Add enterprise SSO',
    add_enterprise_connector_action: 'Set up enterprise SSO',
    organization_permissions: 'Organization permissions',
    permission_name: 'Permission name',
    permissions: 'Permissions',
    organization_roles: 'Organization roles',
    role_name: 'Role name',
    organization_name: 'Organization name',
  },
};

export default Object.freeze(organization);
