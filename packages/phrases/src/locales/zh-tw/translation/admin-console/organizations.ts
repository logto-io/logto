const organizations = {
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
  organization_description_placeholder: '組織的簡要描述',
  organization_permission: '組織權限',
  organization_permission_other: '組織權限',
  organization_permission_description:
    '組織權限是指在組織上下文中訪問資源的授權。組織權限應該以有意義的字符串表示，同時作為名稱和唯一標識。',
  organization_permission_delete_confirm:
    '如果刪除此權限，所有包括此權限的組織角色將失去此權限，擁有此權限的用戶將失去其授予的訪問。',
  create_permission_placeholder: '瀏覽預約歷史',
  permission: '權限',
  permission_other: '權限',
  organization_role: '組織角色',
  organization_role_other: '組織角色',
  organization_role_description:
    '組織角色是一組可以分配給用戶的權限。這些權限必須來自預定義的組織權限。',
  organization_role_delete_confirm:
    '這將從受影響的用戶中刪除與此角色相關的權限，並刪除組織角色、組織成員和組織權限之間的關係。',
  role: '角色',
  create_role_placeholder: '只擁有查看權限的用戶',
  search_placeholder: '按組織名稱或ID搜索',
  search_permission_placeholder: '輸入搜索並選擇權限',
  search_role_placeholder: '輸入搜索並選擇角色',
  guide: {
    title: '從指南開始',
    subtitle: '使用我們的指南來快速啟動應用程式開發流程',
    introduction: {
      section_1: {
        title: '首先，讓我們了解 Logto 中組織的運作方式',
        description:
          '在多租戶SaaS應用程式中，我們經常製作幾個具有相同許可和角色的組織，但在組織上下文中，它可以在控制不同訪問級別方面扮演重要角色。將每個租戶視為 Logto 組織，它們自然分享相同的訪問控制“範本”。我們稱之為“組織範本”。',
      },
      section_2: {
        title: '組織範本由兩部分組成',
        organization_permission_description:
          '組織權限是指在組織上下文中訪問資源的授權。組織權限應該以有意義的字符串表示，同時作為名稱和唯一標識。',
        organization_role_description:
          '組織角色是可以分配給用戶的權限組。這些權限必須來自預定義的組織權限。',
      },
      section_3: {
        title: '與插圖互動，查看所有連結如何互相連接',
        description:
          '讓我們舉個例子。約翰、莎拉和托尼在不同組織中擁有不同角色，在不同組織的上下文中。將游標移到不同的模塊上並查看發生了什麼。',
      },
    },
    step_1: '步驟1：定義組織權限',
    step_2: '步驟2: 定義組織角色',
    step_2_description:
      '“組織角色”代表每個組織最開始授予的一組角色。這些角色由您在上一個畫面中設定的全局權限來確定。與組織權限相似，一旦您第一次完成此設置，您將不需要每次創建新組織時都進行此設置。',
    step_3: '步驟3：創建您的第一個組織',
    step_3_description:
      '讓我們創建您的第一個組織。它帶有一個獨特的ID，並作為處理各種更多面向商業的身份（例如合作夥伴、客戶以及其訪問控制）的容器。',
    more_next_steps: '更多下一步',
    add_members: '將成員新增至您的組織',
    add_members_action: '批量添加成員並分配角色',
    add_enterprise_connector: '新增企業SSO',
    add_enterprise_connector_action: '設定企業SSO',
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
    create_more_roles: '您可以在組織範本設置中創建更多角色。這些組織角色將應用於不同組織。',
    read_resource: '讀取：資源',
    edit_resource: '編輯：資源',
    delete_resource: '刪除：資源',
    ellipsis: '……',
    johnny:
      '約翰是兩個組織的成員，電子郵件為“john@email.com”，作為唯一識別符。他是組織A的管理員，也是組織B的訪客。',
    sarah: '莎拉是一個組織的成員，電子郵件為“sarah@email.com”，作為唯一識別符。她是組織B的管理員。',
    tony: '托尼是一個組織的成員，電子郵件為“tony@email.com”，作為唯一識別符。他是組織C的成員。',
  },
};

export default Object.freeze(organizations);
