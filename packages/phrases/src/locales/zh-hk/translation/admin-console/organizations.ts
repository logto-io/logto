const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: '組織',
  title: '組織',
  subtitle: '代表作為組織存取應用程式的團隊、商業客戶和合作夥伴公司。',
  organization_id: '組織 ID',
  members: '成員',
  create_organization: '建立組織',
  setup_organization: '設定您的組織',
  organization_list_placeholder_title: '組織',
  organization_list_placeholder_text:
    '組織通常在 SaaS 或類似 SaaS 的多租戶應用程式中使用。組織功能使您的 B2B 客戶能夠更好地管理其合作夥伴和客戶，並自定應用程式最終用戶的訪問方式。',
  organization_name_placeholder: '我的組織',
  organization_description_placeholder: '組織的簡要描述',
  organization_permission: '組織權限',
  organization_permission_other: '組織權限',
  organization_permission_description:
    '組織權限指授權在組織上下文中存取資源的許可。組織權限應該以有意義的字串形式表示，同時作為名稱和唯一標識。',
  organization_permission_delete_confirm:
    '如果刪除此權限，所有包含此權限的組織角色都將失去此權限，具有此權限的用戶將失去其授予的訪問權限。',
  create_permission_placeholder: '讀取預約歷史',
  permission: '權限',
  permission_other: '權限',
  organization_role: '組織角色',
  organization_role_other: '組織角色',
  organization_role_description:
    '組織角色是可以分配給用戶的權限的分組。權限必須來自預定義的組織權限。',
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
    title: '開始使用指南',
    subtitle: '使用我們的指南快速開始應用程式開發流程',
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
        title: '交互示意圖，看看它們之間的關係',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: '第 1 步：定義組織權限',
    step_2: '第 2 步：定義組織角色',
    step_2_description:
      '“組織角色”代表每個組織一開始就得到的一組角色。這些角色由您在前一步設置的全局權限所確定。類似組織權限，完成首次設置之後，您將無需每次創建新組繹時都進行此設置。',
    step_3: '第 3 步：創建您的第一個組織',
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
