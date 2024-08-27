const organization_template = {
  title: '組織模板',
  subtitle: '在多租戶 SaaS 應用中，組織範本定義了多個組織的共享訪問控制政策（權限和角色）。',
  roles: {
    tab_name: '組織角色',
    search_placeholder: '按角色名稱搜尋',
    create_title: '創建組織角色',
    role_column: '組織角色',
    permissions_column: '權限',
    placeholder_title: '組織角色',
    placeholder_description: '組織角色是一組可以分配給使用者的權限。權限必須來自預定義的組織權限。',
    create_modal: {
      title: '建立組織角色',
      create: '建立角色',
      name: '角色名稱',
      description: '描述',
      type: '角色類型',
      created: '成功建立組織角色 {{name}}。',
    },
  },
  permissions: {
    tab_name: '組織權限',
    search_placeholder: '按權限名稱搜尋',
    create_org_permission: '創建組織權限',
    permission_column: '組織權限',
    description_column: '描述',
    placeholder_title: '組織權限',
    placeholder_description: '組織權限指的是在組織上下文中訪問資源的授權。',
    delete_confirm:
      '如果刪除此權限，包括此權限的所有組織角色都將失去此權限，擁有此權限的使用者將失去由此權限授予的訪問權限。',
    create_title: '創建組織權限',
    edit_title: '編輯組織權限',
    permission_field_name: '權限名稱',
    description_field_name: '描述',
    description_field_placeholder: '閱讀預約歷史',
    create_permission: '創建權限',
    created: '組織權限 {{name}} 已成功建立。',
  },
};

export default Object.freeze(organization_template);
