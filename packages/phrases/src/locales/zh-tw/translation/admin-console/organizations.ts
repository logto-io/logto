const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  subtitle:
    '組織通常在SaaS或類似的多租戶應用程式中使用，代表您的客戶，這些客戶可以是團隊、組織或整個公司。 組織作為B2B身份驗證和授權的基本元素。',
  organization_template: '組織模板',
  organization_id: '組繹 ID',
  members: '成員',
  create_organization: '建立組繹',
  setup_organization: '設立您的組繹',
  organization_list_placeholder_title: '組繹',
  organization_list_placeholder_text:
    '組繹通常在SaaS或類似的多租戶應用程式中作為最佳做法使用。 它們使您能夠開發應用程式，讓客戶可以創建和管理組繹、邀請成員並分配角色。',
  organization_name_placeholder: '我的組繹',
  organization_description_placeholder: '組繹的簡要描述',
  organization_permission: '組繹權限',
  organization_permission_other: '組繹權限',
  create_permission_placeholder: '瀏覽預約歷史',
  organization_role: '組繹角色',
  organization_role_other: '組繹角色',
  organization_role_description:
    '組繹角色是一組可以分配給用戶的權限。 這些權限必須來自預定義的組繹權限。',
  role: '角色',
  search_placeholder: '按組繹名稱或 ID 搜索',
  search_role_placeholder: '輸入搜索並選擇角色',
  empty_placeholder: '🤔 你目前尚未設置任何 {{entity}}。',
  organization_and_member: '組繹和成員',
  organization_and_member_description:
    '組繹是一個用戶組的群組，可以代表團隊、商業客戶和合作夥伴公司，每個用戶都是一個「成員」。 這些可以是處理多租戶需求的基本實體。',
  guide: {
    title: '從指南開始',
    subtitle: '使用我們的指南快速開始組繹設定',
    introduction: {
      title: '讓我們了解組繹在 Logto 中的運作方式',
      section_1: {
        title: '組繹是一組用戶(身分)組成的集團',
      },
      section_2: {
        title: '組繹模板旨在用於多租戶應用程式存取控制',
        description:
          '在多租戶SaaS應用程式中，多個組繹通常共用相同的存取控制模板，其中包括權限和角色。 在Logto中，我們稱之為「組繹模板」。',
        permission_description: '組繹權限是指在組繹上下文中訪問資源的授權。',
        role_description_deprecated: '組繭角色是一組組繹權限，可以分配給成員。',
        role_description: '組繹角色是可以分配給成員的組繹權限或API權限的分組。',
      },
      section_3: {
        title: '我可以將API權限指派給組繹角色嗎？',
        description:
          '是的，您可以將API權限指派給組繭角色。 Logto提供彈性，有效管理您組繹的角色，允許您在這些角色中包含組繭權限和API權限。',
      },
      section_4: {
        title: '與插圖互動，查看所有連結如何互相連接',
        description:
          '讓我們舉個例子。約翰、莎拉屬於不同的組繫，並在不同組繫的上下文中擔任不同角色。 將滑鼠指針懸停在不同的模塊上並觀察會發生什麼。',
      },
    },
    organization_permissions: '組繹權限',
    organization_roles: '組繹角色',
    admin: '管理員',
    member: '成員',
    guest: '訪客',
    role_description: '角色 "{{role}}" 在不同的組繭中共用相同的組繹模板。',
    john: '約翰',
    john_tip:
      '約翰的電子郵件地址為 "john@email.com"，他屬於兩個組繹，分別作為組繹 A 的管理員和組繹 B 的訪客。',
    sarah: '莎拉',
    sarah_tip: '莎拉的電子郵件地址為 "sarah@email.com"，她屬於一個組繹，並擔任組繹 B 的管理員。',
  },
};

export default Object.freeze(organizations);
