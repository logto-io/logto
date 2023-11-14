const organizations = {
  page_title: '组织',
  title: '组织',
  subtitle: '代表作为组织访问您的应用程序的团队、企业客户和合作伙伴公司。',
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
  guide: {
    title: '从指南开始',
    subtitle: '使用我们的指南快速开始应用程序开发过程',
    introduction: {
      section_1: {
        title: '首先，让我们了解Logto中的组织是如何工作的',
        description:
          '在多租户SaaS应用程序中，我们经常使用相同的权限和角色创建几个组织，但是在组织的上下文中，它可以在控制不同级别的访问方面发挥重要作用。将每个租户视为一个Logto组织，它们自然共享相同的访问控制“模板”。我们称之为“组织模板”。',
      },
      section_2: {
        title: '组织模板由两部分组成',
        organization_permission_description:
          '组织权限是指在组织上下文中访问资源的授权。组织权限应该用有意义的字符串表示，同时也作为名称和唯一标识。',
        organization_role_description:
          '组织角色是可以分配给用户的权限组。这些权限必须来自预定义的组织权限。',
      },
      section_3: {
        title: '交互插图以查看所有关系',
        description:
          '让我们举个例子。John、Sarah和Tony分别属于不同组织，在不同组织的上下文中具有不同的角色。将鼠标悬停在不同的模块上，看看会发生什么。',
      },
    },
    step_1: '步骤1：定义组织权限',
    step_2: '步骤2：定义组织角色',
    step_2_description:
      '“组织角色”代表在开始时分配给每个组织的一组角色。这些角色由您在上一屏幕设置的全局权限确定。类似于组织权限，一旦您第一次完成此设置，您就不需要在每次创建新组织时进行设置。',
    step_3: '步骤3：创建您的第一个组织',
    step_3_description:
      '让我们创建您的第一个组织。它具有一个唯一的ID，并作为一个容器，用于处理各种面向企业的身份，如合作伙伴、客户及其访问控制。',
    more_next_steps: '更多下一步',
    add_members: '将成员添加到您的组织',
    add_members_action: '批量添加成员并分配角色',
    add_enterprise_connector: '添加企业SSO',
    add_enterprise_connector_action: '设置企业SSO',
    organization_permissions: '组织权限',
    permission_name: '权限名称',
    permissions: '权限',
    organization_roles: '组织角色',
    role_name: '角色名称',
    organization_name: '组织名称',
    admin: '管理员',
    admin_description: '“管理员”角色在不同组织之间共享相同的组织模板。',
    member: '成员',
    member_description: '“成员”角色在不同组织之间共享相同的组织模板。',
    guest: '访客',
    guest_description: '“访客”角色在不同组织之间共享相同的组织模板。',
    create_more_roles: '您可以在组织模板设置中创建更多角色。这些组织角色将适用于不同的组织。',
    read_resource: '读取:资源',
    edit_resource: '编辑:资源',
    delete_resource: '删除:资源',
    ellipsis: '……',
    johnny:
      '约翰属于两个组织，电子邮件为“john@email.com”作为唯一标识。他是组织A的管理员，也是组织B的访客。',
    sarah: '萨拉属于一个组织，电子邮件为“sarah@email.com”作为唯一标识。她是组织B的管理员。',
    tony: '托尼属于一个组织，电子邮件为“tony@email.com”作为唯一标识。他是组织C的成员。',
  },
};

export default Object.freeze(organizations);
