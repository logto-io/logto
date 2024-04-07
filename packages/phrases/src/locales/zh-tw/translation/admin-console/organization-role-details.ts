const organization_role_details = {
  page_title: '組織角色詳情',
  back_to_org_roles: '返回組織角色',
  org_role: '組織角色',
  delete_confirm:
    '這樣做將會從受影響的使用者中移除與此角色相關聯的權限，並刪除組織角色、組織成員和組織權限之間的關係。',
  deleted: '組織角色 {{name}} 已成功刪除。',
  permissions: {
    tab: '權限',
    name_column: '權限',
    description_column: '描述',
    type_column: '權限類型',
    type: {
      api: 'API 權限',
      org: '組織權限',
    },
    assign_permissions: '分配權限',
    remove_permission: '移除權限',
    remove_confirmation: '如果移除此權限，擁有此組織角色的使用者將失去此權限所授予的存取權。',
    removed: '權限 {{name}} 已成功從此組織角色中移除',
  },
  general: {
    tab: '一般',
    settings: '設置',
    description: '組織角色是可以分配給用戶的權限組。這些權限必須來自預定義的組織權限。',
    name_field: '名稱',
    description_field: '描述',
    description_field_placeholder: '僅具有查看權限的使用者',
  },
};

export default Object.freeze(organization_role_details);
