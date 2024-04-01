const organization_template = {
  title: '組織模板',
  subtitle:
    '在多租戶SaaS應用中，多個組織共享相同的訪問控制政策，包括權限和角色，是很常見的。在Logto中，這一概念被稱為“組織模板”。使用它可以簡化建立和設計授權模型的過程。',
  org_roles: {
    tab_name: '組織角色',
    search_placeholder: '按角色名稱搜尋',
    create_org_roles: '創建組織角色',
    org_role_column: '組織角色',
    permissions_column: '權限',
    placeholder_title: '組織角色',
    placeholder_description: '組織角色是一組可以分配給使用者的權限。權限必須來自預定義的組織權限。',
  },
  org_permissions: {
    tab_name: '組織權限',
    search_placeholder: '按權限名稱搜尋',
    create_org_permission: '創建組織權限',
    permission_column: '權限',
    description_column: '描述',
    placeholder_title: '組織權限',
    placeholder_description: '組織權限指的是在組織上下文中訪問資源的授權。',
    delete_confirm:
      '如果刪除此權限，包括此權限的所有組織角色都將失去此權限，擁有此權限的使用者將失去由此權限授予的訪問權限。',
  },
};

export default Object.freeze(organization_template);
