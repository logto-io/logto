const organization_template = {
  title: '组织模板',
  subtitle: '在多租户 SaaS 应用中，组织模板定义了多个组织的共享访问控制政策（权限和角色）。',
  roles: {
    tab_name: '组织角色',
    search_placeholder: '按角色名称搜索',
    create_title: '创建组织角色',
    role_column: '组织角色',
    permissions_column: '权限',
    placeholder_title: '组织角色',
    placeholder_description: '组织角色是一组可以分配给用户的权限。权限必须来自预定义的组织权限。',
    create_modal: {
      title: '创建组织角色',
      create: '创建角色',
      name: '角色名称',
      description: '描述',
      type: '角色类型',
      created: '成功创建组织角色 {{name}}。',
    },
  },
  permissions: {
    tab_name: '组织权限',
    search_placeholder: '按权限名称搜索',
    create_org_permission: '创建组织权限',
    permission_column: '组织权限',
    description_column: '描述',
    placeholder_title: '组织权限',
    placeholder_description: '组织权限指的是在组织上下文中访问资源的授权。',
    delete_confirm:
      '如果删除此权限，包括此权限的所有组织角色都将失去此权限，拥有此权限的用户将失去由此权限授予的访问权限。',
    create_title: '创建组织权限',
    edit_title: '编辑组织权限',
    permission_field_name: '权限名称',
    description_field_name: '描述',
    description_field_placeholder: '阅读预约历史',
    create_permission: '创建权限',
    created: '组织权限 {{name}} 已成功创建。',
  },
};

export default Object.freeze(organization_template);
