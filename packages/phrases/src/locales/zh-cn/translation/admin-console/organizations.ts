const organizations = {
  organization: '组织',
  page_title: '组织',
  title: '组织',
  subtitle:
    '组织通常在SaaS或类似的多租户应用程序中使用，代表您的客户，这些客户可以是团队、组织或整个公司。组织作为B2B身份验证和授权的基础元素。',
  organization_template: '组织模板',
  organization_id: '组织 ID',
  members: '成员',
  create_organization: '创建组织',
  setup_organization: '设置您的组织',
  organization_list_placeholder_title: '组织',
  organization_list_placeholder_text:
    '在SaaS或类似的多租户应用程序中，通常作为最佳实践使用组织。它们使您能够开发允许客户创建和管理组织、邀请成员并分配角色的应用程序。',
  organization_name_placeholder: '我的组织',
  organization_description_placeholder: '组织的简要描述',
  organization_permission: '组织权限',
  organization_permission_other: '组织权限',
  create_permission_placeholder: '读取预约历史',
  organization_role: '组织角色',
  organization_role_other: '组织角色',
  organization_role_description:
    '组织角色是可分配给用户的权限组。这些权限必须来自预定义的组织权限。',
  role: '角色',
  search_placeholder: '按组织名称或ID搜索',
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
          '在多租户SaaS应用程序中，多个组织通常共享相同的访问控制模板，包括权限和角色。在Logto中，我们称之为“组织模板”。',
        permission_description: '组织权限是指在组织上下文中访问资源的授权。',
        role_description_deprecated: '组织角色是可分配给成员的组织权限组。',
        role_description: '组织角色是可以分配给成员的组织权限或API权限的分组。',
      },
      section_3: {
        title: '我可以将API权限分配给组织角色吗？',
        description:
          '是的，您可以将API权限分配给组织角色。Logto提供灵活性，有效管理您组织的角色，允许您在这些角色中包括组织权限和API权限。',
      },
      section_4: {
        title: '交互插图以查看所有关系',
        description:
          '让我们举个例子。约翰、莎拉位于不同的组织中，其在不同组织上下文中拥有不同的角色。将鼠标悬停在不同模块上，看看会发生什么。',
      },
    },
    organization_permissions: '组织权限',
    organization_roles: '组织角色',
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
