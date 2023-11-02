const organizations = {
  /** UNTRANSLATED */
  page_title: 'Organizations',
  /** UNTRANSLATED */
  title: 'Organizations',
  /** UNTRANSLATED */
  subtitle:
    'Represent the teams, business customers, and partner companies that access your applications as organizations.',
  /** UNTRANSLATED */
  organization_id: 'Organization ID',
  /** UNTRANSLATED */
  members: 'Members',
  /** UNTRANSLATED */
  create_organization: 'Create organization',
  /** UNTRANSLATED */
  organization_name_placeholder: 'My organization',
  /** UNTRANSLATED */
  organization_description_placeholder: 'A brief description of the organization.',
  /** UNTRANSLATED */
  organization_permission: 'Organization permission',
  /** UNTRANSLATED */
  organization_permission_other: 'Organization permissions',
  /** UNTRANSLATED */
  organization_permission_description:
    'Organization permission refers to the authorization to access a resource in the context of organization. An organization permission should be represented as a meaningful string, also serving as the name and unique identifier.',
  /** UNTRANSLATED */
  organization_permission_delete_confirm:
    'If this permission is deleted, all organization roles including this permission will lose this permission, and users who had this permission will lose the access granted by it.',
  /** UNTRANSLATED */
  create_permission_placeholder: 'Read appointment history.',
  /** UNTRANSLATED */
  permission: 'Permission',
  /** UNTRANSLATED */
  permission_other: 'Permissions',
  /** UNTRANSLATED */
  organization_role: 'Organization role',
  /** UNTRANSLATED */
  organization_role_other: 'Organization roles',
  /** UNTRANSLATED */
  organization_role_description:
    'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
  /** UNTRANSLATED */
  organization_role_delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  /** UNTRANSLATED */
  role: 'Role',
  /** UNTRANSLATED */
  create_role_placeholder: 'Users with view-only permissions.',
  /** UNTRANSLATED */
  search_permission_placeholder: 'Type to search and select permissions',
  /** UNTRANSLATED */
  search_role_placeholder: 'Type to search and select roles',
  guide: {
    /** UNTRANSLATED */
    title: 'Start with guides',
    /** UNTRANSLATED */
    subtitle: 'Jumpstart your app development process with our guides',
    /** UNTRANSLATED */
    brief_title: "First, let's understand how organizations works in Logto",
    /** UNTRANSLATED */
    brief_introduction:
      "In a multi-tenant app, it's important to set clear authorization rules to keep each tenant's data separate. Think of each tenant of your product as its own Logto organization, and they should naturally share the same access control template by default. <a>Learn more</a>",
    /** UNTRANSLATED */
    step_1: 'Step 1: Define organization permissions',
    /** UNTRANSLATED */
    step_2: 'Step 2: Define organization roles',
    /** UNTRANSLATED */
    step_2_description:
      '"Organization roles" represent a set of roles given to each organization at the start. These roles are determined by the global permissions you have set in previous screen. Similar with org permission, once you finish this setting for the first time, you won’t need to do this every-time you create a new organization.',
    /** UNTRANSLATED */
    step_3: 'Step 3: Create your first organization',
    /** UNTRANSLATED */
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    /** UNTRANSLATED */
    more_next_steps: 'More next steps',
    /** UNTRANSLATED */
    add_members: 'Add members to your organization',
    /** UNTRANSLATED */
    add_members_action: 'Bulk add members and assign roles',
    /** UNTRANSLATED */
    add_enterprise_connector: 'Add enterprise SSO',
    /** UNTRANSLATED */
    add_enterprise_connector_action: 'Set up enterprise SSO',
    /** UNTRANSLATED */
    organization_permissions: 'Organization permissions',
    /** UNTRANSLATED */
    permission_name: 'Permission name',
    /** UNTRANSLATED */
    permissions: 'Permissions',
    /** UNTRANSLATED */
    organization_roles: 'Organization roles',
    /** UNTRANSLATED */
    role_name: 'Role name',
    /** UNTRANSLATED */
    organization_name: 'Organization name',
  },
};

export default Object.freeze(organizations);
