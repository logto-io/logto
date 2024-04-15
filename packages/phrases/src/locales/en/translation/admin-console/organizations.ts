const organizations = {
  organization: 'Organization',
  page_title: 'Organizations',
  title: 'Organizations',
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: 'Organization template',
  organization_id: 'Organization ID',
  members: 'Members',
  create_organization: 'Create organization',
  setup_organization: 'Set up your organization',
  organization_list_placeholder_title: 'Organization',
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
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
  empty_placeholder: '🤔 You don’t have any {{entity}} set up yet.',
  organization_and_member: 'Organization and member',
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'Start with guides',
    subtitle: 'Jumpstart your organization settings with our guides',
    introduction: {
      title: "Let's understand how organization works in Logto",
      section_1: {
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        title: 'Organization template is designed for multi-tenant apps access control',
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: 'Can I assign API permissions to organization roles?',
        description:
          "Yes, you can assign API permissions to organization roles. Logto offers the flexibility to manage your organization's roles effectively, allowing you to include both organization permissions and API permissions within those roles.",
      },
      section_4: {
        title: 'Interact with the illustration to see how everything connects',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Step 1: Define organization permissions',
    step_2: 'Step 2: Define organization roles',
    step_3: 'Step 3: Create your first organization',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities.",
    more_next_steps: 'More next steps',
    add_members: 'Add members to your organization',
    config_organization: 'Configure organization',
    organization_permissions: 'Organization permissions',
    permission_name: 'Permission name',
    permissions: 'Permissions',
    organization_roles: 'Organization roles',
    role_name: 'Role name',
    organization_name: 'Organization name',
    admin: 'Admin',
    member: 'Member',
    guest: 'Guest',
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    john: 'John',
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
