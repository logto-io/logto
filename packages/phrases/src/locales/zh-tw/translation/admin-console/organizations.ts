const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: '組織',
  title: '組織',
  subtitle: '代表團隊、商業客戶和合作夥伴公司作為組織訪問您的應用程式。',
  organization_id: '組織 ID',
  members: '成員',
  create_organization: '建立組織',
  setup_organization: '設立您的組織',
  organization_list_placeholder_title: '組織',
  organization_list_placeholder_text:
    '組織通常用於SaaS或類似SaaS的多租戶應用程式。組織功能允許您的B2B客戶更好地管理其合作夥伴和客戶，並自定義最終用戶訪問其應用程式的方式。',
  organization_name_placeholder: '我的組織',
  organization_description_placeholder: '組繹的簡要描述',
  organization_permission: '組繹權限',
  organization_permission_other: '組繹權限',
  organization_permission_description:
    '組繹權限是指在組繹上下文中訪問資源的授權。組繹權限應該以有意義的字符串表示，同時作為名稱和唯一標識。',
  organization_permission_delete_confirm:
    '如果刪除此權限，所有包括此權限的組繹角色將失去此權限，擁有此權限的用戶將失去其授予的訪問。',
  create_permission_placeholder: '瀏覽預約歷史',
  permission: '權限',
  permission_other: '權限',
  organization_role: '組繹角色',
  organization_role_other: '組繹角色',
  organization_role_description:
    '組繹角色是一組可以分配給用戶的權限。這些權限必須來自預定義的組繹權限。',
  organization_role_delete_confirm:
    '這將從受影響的用戶中刪除與此角色相關的權限，並刪除組繹角色、組繹成員和組繹權限之間的關係。',
  role: '角色',
  create_role_placeholder: '只擁有查看權限的用戶',
  search_placeholder: '按組繹名稱或ID搜索',
  search_permission_placeholder: '輸入搜索並選擇權限',
  search_role_placeholder: '輸入搜索並選擇角色',
  empty_placeholder: '🤔 你目前尚未設置任何 {{entity}} 。',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: '從指南開始',
    subtitle: '使用我們的指南來快速啟動應用程式開發流程',
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
        title: '與插圖互動，查看所有連結如何互相連接',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: '步驟1：定義組繹權限',
    step_2: '步驟2: 定義組繹角色',
    step_2_description:
      '“組繹角色”代表每個組繹最開始授予的一組角色。這些角色由您在上一個畫面中設定的全局權限來確定。與組繹權限相似，一旦您第一次完成此設置，您將不需要每次創建新組繹時都進行此設置。',
    step_3: '步驟3：創建您的第一個組繹',
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
