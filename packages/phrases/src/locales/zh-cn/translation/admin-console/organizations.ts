const organizations = {
  organization: '组织',
  page_title: '组织',
  title: '组织',
  subtitle: '组织是一组用户的集合，包括使用您的应用程序的团队、业务客户和合作伙伴公司。',
  organization_template: '组织模板',
  organization_id: '组织 ID',
  members: '成员',
  create_organization: '创建组织',
  setup_organization: '设置您的组织',
  organization_list_placeholder_title: '组织',
  organization_list_placeholder_text:
    '组织通常用于SaaS或类SaaS的多租户应用程序。组织功能使您的B2B客户能更好地管理其合作伙伴和客户，并自定义最终用户访问其应用程序的方式。',
  organization_name_placeholder: '我的组织',
  organization_description_placeholder: '组织的简要描述',
  organization_permission: '组织权限',
  organization_permission_other: '组织权限',
  organization_permission_description:
    '组织权限是指在组织上下文中访问资源的授权。组织权限应该用有意义的字符串表示，同时也作为名称和唯一标识。',
  organization_permission_delete_confirm:
    '如果删除此权限，所有包含此权限的组织角色将失去此权限以及授予此权限的用户的访问权限。',
  create_permission_placeholder: '读取预约历史',
  permission: '权限',
  permission_other: '权限',
  organization_role: '组织角色',
  organization_role_other: '组织角色',
  organization_role_description:
    '组织角色是可以分配给用户的权限组。这些权限必须来自预定义的组织权限。',
  organization_role_delete_confirm:
    '这样做将从受影响的用户那里删除与此角色相关的权限，并删除组织角色、组织成员和组织权限之间的关系。',
  role: '角色',
  create_role_placeholder: '仅查看权限的用户',
  search_placeholder: '按组织名称或ID搜索',
  search_permission_placeholder: '输入以搜索和选择权限',
  search_role_placeholder: '输入以搜索和选择角色',
  empty_placeholder: '🤔 你还没有设置任何{{entity}}。',
  organization_and_member: '组织和成员',
  organization_and_member_description:
    '组织是一个用户组，可以代表团队、业务客户和合作伙伴公司，每个用户都是“成员”。这些可以是处理您的多租户需求的基本实体。',
  guide: {
    title: '从指南开始',
    subtitle: '使用我们的指南快速开始组织设置',
    introduction: {
      title: '让我们了解Logto中的组织工作原理',
      section_1: {
        title: '组织是一组用户（身份）',
      },
      section_2: {
        title: '组织模板专为多租户应用程序访问控制而设计',
        description:
          '在多租户SaaS应用程序中，多个组织通常共享相同的访问控制模板，其中包括权限和角色。在Logto中，我们称之为“组织模板”。',
        permission_description: '组织权限是指在组织上下文中访问资源的授权。',
        role_description: '组织角色是可以分配给成员的组织权限组。',
      },
      section_3: {
        title: '交互插图以查看所有关系',
        description:
          '让我们举个例子。约翰、莎拉位于不同的组织中，其在不同组织上下文中拥有不同的角色。将鼠标悬停在不同模块上，看看会发生什么。',
      },
    },
    step_1: '步骤1：定义组织权限',
    step_2: '步骤2：定义组织角色',
    step_3: '步骤3：创建您的第一个组织',
    step_3_description:
      '让我们创建您的第一个组织。它具有唯一的ID，并且可以作为处理各种业务向身份的容器。',
    more_next_steps: '更多下一步',
    add_members: '向您的组织添加成员',
    add_members_action: '批量添加成员并分配角色',
    organization_permissions: '组织权限',
    permission_name: '权限名',
    permissions: '权限',
    organization_roles: '组织角色',
    role_name: '角色名',
    organization_name: '组织名称',
    admin: '管理员',
    member: '成员',
    guest: '访客',
    role_description: '角色“{{role}}”在不同组织中共享相同的组织模板。',
    john: '约翰',
    john_tip:
      '约翰隶属于两个组织，以电子邮件“john@email.com”作为唯一标识。他是组织A的管理员，也是组织B的访客。',
    sarah: '莎拉',
    sarah_tip: '莎拉隶属于一个组织，以电子邮件“sarah@email.com”作为唯一标识。她是组织B的管理员。',
  },
};

export default Object.freeze(organizations);
