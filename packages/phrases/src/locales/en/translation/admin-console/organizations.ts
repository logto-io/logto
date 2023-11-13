const organization = {
  page_title: 'Organizations',
  title: 'Organizations',
  subtitle:
    'Represent the teams, business customers, and partner companies that access your applications as organizations.',
  organization_id: 'Organization ID',
  members: 'Members',
  create_organization: 'Create organization',
  setup_organization: 'Set up your organization',
  organization_list_placeholder_title: 'Organization',
  organization_list_placeholder_text:
    'Organization is usually used in SaaS or SaaS-like multi-tenancy apps. The Organizations feature allows your B2B customers to better manage their partners and customers, and to customize the ways that end-users access their applications.',
  organization_name_placeholder: 'My organization',
  organization_description_placeholder: 'A brief description of the organization',
  organization_permission: 'Organization permission',
  organization_permission_other: 'Organization permissions',
  organization_permission_description:
    'Organization permission refers to the authorization to access a resource in the context of organization. An organization permission should be represented as a meaningful string, also serving as the name and unique identifier.',
  organization_permission_delete_confirm:
    'If this permission is deleted, all organization roles including this permission will lose this permission, and users who had this permission will lose the access granted by it.',
  create_permission_placeholder: 'Read appointment history',
  permission: 'Permission',
  permission_other: 'Permissions',
  organization_role: 'Organization role',
  organization_role_other: 'Organization roles',
  organization_role_description:
    'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
  organization_role_delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  role: 'Role',
  create_role_placeholder: 'Users with view-only permissions',
  search_placeholder: 'Search by organization name or ID',
  search_permission_placeholder: 'Type to search and select permissions',
  search_role_placeholder: 'Type to search and select roles',
  guide: {
    title: 'Start with guides',
    subtitle: 'Jumpstart your app development process with our guides',
    introduction: {
      section_1: {
        title: "First, let's understand how organizations works in Logto",
        description:
          'In multi-tenant SaaS apps, we often make several organizations with the same set of permissions and roles, but within the context of an organization it can play an important part in controlling varying levels of access. Think of each tenant is like a Logto organization, and they naturally share the same access control “template”. We call this the "organization template."',
      },
      section_2: {
        title: 'Organization template consists of two parts',
        organization_permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization. An organization permission should be represented as a meaningful string, also serving as the name and unique identifier.',
        organization_role_description:
          'Organization role is a grouping of permissions that can be assigned to users. The permissions must come from the predefined organization permissions.',
      },
      section_3: {
        title: 'Interact the illustration to see how everything connects',
        description:
          "Let's take an example. John, Sarah and Tony are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
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
    admin: 'Admin',
    admin_description:
      'Role "Admin" share the same organization template across different organizations.',
    member: 'Member',
    member_description:
      'Role "Member" share the same organization template across different organizations.',
    guest: 'Guest',
    guest_description:
      'Role "Guest" share the same organization template across different organizations.',
    create_more_roles:
      'You can create more roles in the organization template settings. Those organization roles will apply to different organizations.',
    read_resource: 'read:resource',
    edit_resource: 'edit:resource',
    delete_resource: 'delete:resource',
    ellipsis: '……',
    johnny:
      'Johny belongs to two organization with the email "john@email.com" as the single identifier. He is the admin of organization A as well as guest of organization B.',
    sarah:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
    tony: 'Tony belongs to one organization with the email "tony@email.com" as the single identifier. He is the member of organization C.',
  },
};

export default Object.freeze(organization);
