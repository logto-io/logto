const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  subtitle: '組繹是一個用戶的集合，其中包括使用您應用程式的團隊、商業客戶和合作夥伴公司。',
  organization_template: '組繹範本',
  organization_id: '組繹 ID',
  members: '成員',
  create_organization: '建立組織',
  setup_organization: '設立您的組織',
  organization_list_placeholder_title: '組織',
  organization_list_placeholder_text:
    '組繹通常用於 SaaS 或類似 SaaS 的多租戶應用程式。組繹功能允許您的 B2B 客戶更好地管理其合作夥伴和客戶，並自定義最終用戶訪問其應用程式的方式。',
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
  search_placeholder: '按組繹名稱或 ID 搜索',
  search_permission_placeholder: '輸入搜索並選擇權限',
  search_role_placeholder: '輸入搜索並選擇角色',
  empty_placeholder: '🤔 你目前尚未設置任何 {{entity}} 。',
  organization_and_member: '組繹和成員',
  organization_and_member_description:
    '組繹是一組用戶，可以代表團隊、商業客戶和合作夥伴公司，每個用戶都是"成員"。這些可以是處理您的多租戶要求的基本實體。',
  guide: {
    title: '從指南開始',
    subtitle: '使用我們的指南來啟動組繹設置',
    introduction: {
      title: '讓我們了解在 Logto 中如何運作組繹',
      section_1: {
        title: '組繹是一組用戶(身份)/* UNTRANSLATED */',
      },
      section_2: {
        title: '組繹範本是為多租戶應用程式設計的存取控制/* UNTRANSLATED */',
        description:
          '在多租戶 SaaS 應用程式中，多個組繹通常共享相同的存取控制範本，其中包括權限和角色。在 Logto 中，我們稱之為 "組繹範本"。',
        permission_description: '組繹權限指的是在組繹上下文中訪問資源的授權。',
        role_description: '組繹角色是可以分配給成員的組繹權限的分組。',
      },
      section_3: {
        title: '與插圖互動，查看所有連結如何互相連接',
        description:
          '讓我們舉個例子。約翰、莎拉在不同組繹中擁有不同的角色，屬於不同組繹的上下文。將鼠標懸停在不同的模塊上，看看會發生什麼。',
      },
    },
    step_1: '步驟1：定義組繹權限',
    step_2: '步驟2: 定義組繹角色',
    step_3: '步驟3：創建您的第一個組繹',
    step_3_description:
      '让我们来创建您的第一个組繹。它具有独特的 ID，并且可以作为用於处理各种面向业务的标识的容器。',
    more_next_steps: '更多下一步',
    add_members: '將成員添加到您的組繹',
    add_members_action: '批量添加成員並分配角色',
    organization_permissions: '組繹權限',
    permission_name: '權限名稱',
    permissions: '權限',
    organization_roles: '組繹角色',
    role_name: '角色名稱',
    organization_name: '組繹名稱',
    admin: '管理員',
    member: '成員',
    guest: '訪客',
    role_description: '角色 "{{role}}" 在不同組繹之間共享相同的組繹範本。',
    john: '約翰',
    john_tip:
      '約翰隸屬於兩個組繹，使用 "john@email.com" 電子郵件作為唯一標識。他是組繹 A 的管理員，也是組繹 B 的訪客。',
    sarah: '莎拉',
    sarah_tip:
      '莎拉隸屬於一個組繹，使用 "sarah@email.com" 電子郵件作為唯一標識。她是組繹 B 的管理員。',
  },
};

export default Object.freeze(organizations);
