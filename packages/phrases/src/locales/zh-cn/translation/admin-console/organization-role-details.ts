const organization_role_details = {
  page_title: '组织角色详情',
  back_to_org_roles: '返回组织角色',
  org_role: '组织角色',
  delete_confirm:
    '这样做将从受影响的用户中删除与此角色关联的权限，并删除组织角色、组织成员和组织权限之间的关系。',
  deleted: '组织角色 {{name}} 已成功删除。',
  permissions: {
    tab: '权限',
    name_column: '权限',
    description_column: '描述',
    type_column: '权限类型',
    type: {
      api: 'API 权限',
      org: '组织权限',
    },
    assign_permissions: '分配权限',
    remove_permission: '移除权限',
    remove_confirmation: '如果移除此权限，拥有此组织角色的用户将失去此权限授予的访问权限。',
    removed: '权限 {{name}} 已成功从此组织角色中移除',
  },
  general: {
    tab: '常规',
    settings: '设置',
    description: '组织角色是可以分配给用户的权限组。这些权限必须来自预定义的组织权限。',
    name_field: '名称',
    description_field: '描述',
    description_field_placeholder: '仅具有查看权限的用户',
  },
};

export default Object.freeze(organization_role_details);
