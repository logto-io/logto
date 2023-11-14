const organizations = {
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
    '這樣將從受影響的用戶身上刪除與此角色關聯的權限，並刪除組織角色、組織成員和組織權限之間的關係。',
  role: '角色',
  create_role_placeholder: '僅擁有檢視權限的用戶',
  search_placeholder: '按組織名稱或 ID 搜索',
  search_permission_placeholder: '輸入並搜索選擇權限',
  search_role_placeholder: '輸入並搜索選擇角色',
  guide: {
    title: '開始使用指南',
    subtitle: '使用我們的指南快速開始應用程式開發流程',
    introduction: {
      section_1: {
        title: '首先，讓我們了解 Logto 中組織的運作方式',
        description:
          '在多租戶 SaaS 應用程式中，我們經常製作具有相同權限和角色設定的多個組織，但在組織的上下文中，它在控制不同層級的存取權方面可以起著重要作用。每個租戶都像是 Logto 組織，它們自然共享相同的存取控制“範本”。我們稱這個為“組織範本”。',
      },
      section_2: {
        title: '組織範本由兩部分組成',
        organization_permission_description:
          '組織權限指授權在組織上下文中存取資源的許可。組織權限應該以有意義的字串形式表示，同時作為名稱和唯一標識。',
        organization_role_description:
          '組織角色是可以分配給用戶的權限的分組。權限必須來自預定義的組織權限。',
      },
      section_3: {
        title: '交互示意圖，看看它們之間的關係',
        description:
          '讓我們舉個例子。約翰、莎拉和托尼處於不同組織中，擁有不同的角色。將滑鼠懸停在不同區塊上，看看會發生什麼。',
      },
    },
    step_1: '第 1 步：定義組織權限',
    step_2: '第 2 步：定義組織角色',
    step_2_description:
      '“組織角色”代表每個組織一開始就得到的一組角色。這些角色由您在前一步設置的全局權限所確定。類似組織權限，完成首次設置之後，您將無需每次創建新組織時都進行此設置。',
    step_3: '第 3 步：創建您的第一個組織',
    step_3_description:
      '讓我們創建您的第一個組織。它具有唯一的 ID，作為處理各種更多面向業務的身份（例如合作夥伴、客戶）及其存取控制的容器。',
    more_next_steps: '更多下一步',
    add_members: '將成員新增到您的組織',
    add_members_action: '批量新增成員並分配角色',
    add_enterprise_connector: '添加企業 SSO',
    add_enterprise_connector_action: '設定企業 SSO',
    organization_permissions: '組織權限',
    permission_name: '權限名稱',
    permissions: '權限',
    organization_roles: '組織角色',
    role_name: '角色名稱',
    organization_name: '組織名稱',
    admin: '管理員',
    admin_description: '“管理員”角色在不同組織中共享相同的組織範本。',
    member: '成員',
    member_description: '“成員”角色在不同組織中共享相同的組織範本。',
    guest: '訪客',
    guest_description: '“訪客”角色在不同組織中共享相同的組織範本。',
    create_more_roles: '您可以在組織範本設定中創建更多角色。這些組織角色將適用於不同的組織。',
    read_resource: '讀取:資源',
    edit_resource: '編輯:資源',
    delete_resource: '刪除:資源',
    ellipsis: '……',
    johnny:
      '約翰隸屬於兩個組織，電郵為 "john@email.com" 為唯一識別。他是組織 A 的管理員，也是組織 B 的訪客。',
    sarah: '莎拉隸屬於一個組織，電郵為 "sarah@email.com" 為唯一識別。她是組織 B 的管理員。',
    tony: '托尼隸屬於一個組織，電郵為 "tony@email.com" 為唯一識別。他是組織 C 的成員。',
  },
};

export default Object.freeze(organizations);
