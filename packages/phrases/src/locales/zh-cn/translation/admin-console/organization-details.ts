const organization_details = {
  page_title: '机构详情',
  delete_confirmation:
    '一旦删除，所有成员将失去他们在这个机构中的成员资格和角色。此操作将无法撤销。',
  organization_id: '机构编号',
  settings_description: '机构代表可以访问您的应用程序的团队、业务客户和合作伙伴公司。',
  name_placeholder: '组织名称，不需要是唯一的。',
  description_placeholder: '机构的描述。',
  member: '成员',
  member_other: '成员',
  add_members_to_organization: '向机构{{name}}添加成员',
  add_members_to_organization_description:
    '通过姓名、电子邮件、电话或用户ID搜索合适的用户。搜索结果中不显示现有成员。',
  add_with_organization_role: '以机构角色加入',
  user: '用户',
  application: '应用',
  application_other: '应用',
  add_applications_to_organization: '向组织{{name}}添加应用',
  add_applications_to_organization_description:
    '通过搜索应用 ID、名称或描述来找到合适的应用。搜索结果中不显示现有应用。',
  at_least_one_application: '至少需要一个应用。',
  remove_application_from_organization: '从机构中移除应用',
  remove_application_from_organization_description:
    '一旦移除，应用将失去其在该机构中的关联和角色。此操作将无法撤销。',
  search_application_placeholder: '按应用 ID、名称或描述搜索',
  roles: '机构角色',
  authorize_to_roles: '授权{{name}}访问以下角色:',
  edit_organization_roles: '编辑机构角色',
  edit_organization_roles_title: '编辑{{name}}的机构角色',
  remove_user_from_organization: '从机构中移除用户',
  remove_user_from_organization_description:
    '一旦移除，用户将失去他们在这个机构中的成员资格和角色。此操作将无法撤销。',
  search_user_placeholder: '按名称、电子邮件、电话或用户ID搜索',
  at_least_one_user: '至少需要一个用户。',
  organization_roles_tooltip: '{{type}}在此机构中分配的角色。',
  custom_data: '自定义数据',
  custom_data_tip: '自定义数据是一个 JSON 对象，可用于存储与机构关联的附加数据。',
  invalid_json_object: '无效的 JSON 对象。',
  branding: {
    logo: '机构标志',
    logo_tooltip:
      '你可以传递机构 ID 以在登录体验中显示此标志；如果在全套登录体验设置中启用了深色模式，则需要深色版本的标志。<a>了解更多</a>',
  },
  jit: {
    title: '即时供应',
    description:
      '用户可以在通过某些身份验证方法首次登录时自动加入机构并被分配角色。你可以设置即时供应的要求。',
    email_domain: '电子邮件域供应',
    email_domain_description:
      '新用户使用他们的验证电子邮件地址注册或通过验证电子邮件地址的社交登录，将自动加入机构。<a>了解更多</a>',
    email_domain_placeholder: '输入即时供应的电子邮件域',
    invalid_domain: '无效的域',
    domain_already_added: '域已添加',
    sso_enabled_domain_warning:
      '你输入了一个或多个与企业 SSO 关联的电子邮件域。使用这些电子邮件的用户将遵循标准的 SSO 流程，除非配置了企业 SSO 供应，否则不会被分配到该机构。',
    enterprise_sso: '企业 SSO 供应',
    no_enterprise_connector_set:
      '你尚未设置任何企业 SSO 连接器。首先添加连接器，以启用企业 SSO 供应。<a>设置</a>',
    add_enterprise_connector: '添加企业连接器',
    enterprise_sso_description:
      '通过企业 SSO 首次登录的新用户或现有用户将自动加入机构。<a>了解更多</a>',
    organization_roles: '默认机构角色',
    organization_roles_description: '通过即时供应加入机构时分配角色。',
  },
  mfa: {
    title: '多因素认证 (MFA)',
    tip: '当要求 MFA 时，没有配置 MFA 的用户在试图交换机构令牌时将被拒绝。此设置不影响用户身份验证。',
    description: '要求用户配置多因素认证才能访问此机构。',
    no_mfa_warning:
      '你的租户没有启用多因素认证方法。用户将无法访问此机构，直到启用至少一种<a>多因素认证方法</a>。',
  },
};

export default Object.freeze(organization_details);
