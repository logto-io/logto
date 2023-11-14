const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: '组织',
  title: '组织',
  subtitle: '代表作为组织访问您的应用程序的团队、企业客户和合作伙伴公司。',
  organization_id: '组织 ID',
  members: '成员',
  create_organization: '创建组织',
  setup_organization: '设置您的组织',
  organization_list_placeholder_title: '组织',
  organization_list_placeholder_text:
    '组织通常用于SaaS或类SaaS的多租户应用程序。组织功能使您的B2B客户能更好地管理其合作伙伴和客户，并自定义最终用户访问其应用程序的方式。',
  organization_name_placeholder: '我的组织',
  organization_description_placeholder: '组织的简要描述',
  organization_permission: '组织权限',
  organization_permission_other: '组织权限',
  organization_permission_description:
    '组织权限是指在组织上下文中访问资源的授权。组织权限应该用有意义的字符串表示，同时也作为名称和唯一标识。',
  organization_permission_delete_confirm:
    '如果删除此权限，所有包含此权限的组织角色将失去此权限以及授予此权限的用户的访问权限。',
  create_permission_placeholder: '读取预约历史',
  permission: '权限',
  permission_other: '权限',
  organization_role: '组织角色',
  organization_role_other: '组织角色',
  organization_role_description:
    '组织角色是可以分配给用户的权限组。这些权限必须来自预定义的组织权限。',
  organization_role_delete_confirm:
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  /** UNTRANSLATED */
  role: 'Role',
  /** UNTRANSLATED */
  create_role_placeholder: 'Users with view-only permissions',
  /** UNTRANSLATED */
  search_placeholder: 'Search by organization name or ID',
  /** UNTRANSLATED */
  search_permission_placeholder: 'Type to search and select permissions',
  /** UNTRANSLATED */
  search_role_placeholder: 'Type to search and select roles',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: '从指南开始',
    subtitle: '使用我们的指南快速开始应用程序开发过程',
    introduction: {
      /** UNTRANSLATED */
      title: "Let's understand how organization works in Logto",
      section_1: {
        /** UNTRANSLATED */
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        /** UNTRANSLATED */
        title: 'Organization template is designed for multi-tenant apps access control',
        /** UNTRANSLATED */
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        /** UNTRANSLATED */
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        /** UNTRANSLATED */
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: '交互插图以查看所有关系',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: '步骤1：定义组织权限',
    step_2: '步骤2：定义组织角色',
    step_2_description:
      '“组织角色”代表在开始时分配给每个组织的一组角色。这些角色由您在上一屏幕设置的全局权限确定。类似于组织权限，一旦您第一次完成此设置，您就不需要在每次创建新组织时进行设置。',
    step_3: '步骤3：创建您的第一个组织',
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
    /** UNTRANSLATED */
    admin: 'Admin',
    /** UNTRANSLATED */
    member: 'Member',
    /** UNTRANSLATED */
    guest: 'Guest',
    /** UNTRANSLATED */
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    /** UNTRANSLATED */
    john: 'John',
    /** UNTRANSLATED */
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    /** UNTRANSLATED */
    sarah: 'Sarah',
    /** UNTRANSLATED */
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
