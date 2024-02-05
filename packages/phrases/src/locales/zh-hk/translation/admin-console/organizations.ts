const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  /** UNTRANSLATED */
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: '組織模板',
  organization_id: '組織 ID',
  members: '成員',
  create_organization: '建立組織',
  setup_organization: '設定您的組織',
  organization_list_placeholder_title: '組織',
  /** UNTRANSLATED */
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
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
    '這樣將從受影響的用戶身上刪除與此角色關聯的權限，並刪除組織角色、組織成員和組織權限之間的關係。',
  role: '角色',
  create_role_placeholder: '僅擁有檢視權限的用戶',
  search_placeholder: '按組織名稱或 ID 搜索',
  search_permission_placeholder: '輸入並搜索選擇權限',
  search_role_placeholder: '輸入並搜索選擇角色',
  empty_placeholder: '🤔 你尚未設置任何 {{entity}}。',
  organization_and_member: '組織和成員',
  organization_and_member_description:
    '組織是一組用戶，可以代表團隊、商業客戶和合作夥伴公司，每個用戶都是「成員」。這些可以是處理多租戶需求的基本實體。',
  guide: {
    title: '開始使用指南',
    subtitle: '通過我們的指南快速設置您的組織設定',
    introduction: {
      title: '讓我們一起了解 Logto 中的組織運作',
      section_1: {
        title: '組織是一組用戶（身份）',
      },
      section_2: {
        title: '組織模板專為多租戶應用程式訪問控制而設計',
        description:
          '在多租戶 SaaS 應用程式中，多個組織通常共用相同的訪問控制模板，其中包括權限和角色。在 Logto 中，我們稱之為「組織模板」。',
        permission_description: '組織權限指授權在組織上下文中存取資源。',
        role_description: '組織角色是可以分配給成員的組織權限的分組。',
      },
      section_3: {
        title: '交互示意圖，看看它們之間的關係',
        description:
          '讓我們舉個例子。John、Sarah 屬於不同的組織，在不同組織的上下文中具有不同的角色。懸停在不同的模塊上，看看會發生什麼。',
      },
    },
    step_1: '第 1 步：定義組織權限',
    step_2: '第 2 步：定義組織角色',
    step_3: '第 3 步：創建您的第一個組織',
    step_3_description:
      '讓我們一起建立您的第一個組織。它具有唯一的 ID，可以作為處理各種面向業務的實體的容器。',
    more_next_steps: '更多下一步',
    add_members: '將成員添加到您的組織',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
    organization_permissions: '組織權限',
    permission_name: '權限名稱',
    permissions: '權限列表',
    organization_roles: '組織角色',
    role_name: '角色名稱',
    organization_name: '組織名稱',
    admin: '管理員',
    member: '成員',
    guest: '訪客',
    role_description: '角色「{{role}}」在不同組織間共享相同的組織模板。',
    john: '約翰',
    john_tip:
      '約翰使用 "john@email.com" 作為唯一標識屬於兩個組織。他是組織 A 的管理員，同時是組織 B 的訪客。',
    sarah: '莎拉',
    sarah_tip: '莎拉使用 "sarah@email.com" 作為唯一標識屬於一個組織。她是組織 B 的管理員。',
  },
};

export default Object.freeze(organizations);
