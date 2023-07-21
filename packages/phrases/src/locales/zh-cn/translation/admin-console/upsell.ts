const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: '升级计划',
  compare_plans: '比较计划',
  contact_us: '联系我们',
  get_started: {
    title: '开始您无缝的身份管理之旅，选择<planName/>！',
    description:
      '<planName/>非常适合您的个人项目或试用。要充分利用 Logto 团队的功能，请升级并获得无限制访问高级功能：无限 MAU 使用、机器对机器集成、无缝 RBAC 管理、长期审计日志等等。',
    view_plans: '查看计划',
  },
  create_tenant: {
    title: '选择您的租户计划',
    description:
      'Logto 提供创新且经济实惠的定价计划，旨在为不断发展的公司提供竞争优势。 <a>了解更多</a>',
    base_price: '基础价格',
    monthly_price: '每月 {{value, number}}',
    mau_unit_price: 'MAU 单价',
    view_all_features: '查看所有功能',
    select_plan: '选择<name/>',
    upgrade_to: '升级至<name/>',
    free_tenants_limit: '最多{{count, number}}个免费租户',
    free_tenants_limit_other: '最多{{count, number}}个免费租户',
    most_popular: '最受欢迎',
    upgrade_success: '成功升级至<name/>',
  },
  paywall: {
    applications:
      '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
    applications_other:
      '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
    machine_to_machine_feature:
      '升级到付费计划以创建机器对机器应用，并获得所有高级功能的访问权限。如需帮助，请随时<a>联系我们</a>。',
    machine_to_machine:
      '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
    machine_to_machine_other:
      '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
    resources:
      '已达到<planName/>的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。<a>联系我们</a>寻求帮助。',
    resources_other:
      '已达到<planName/>的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。<a>联系我们</a>寻求帮助。',
    scopes_per_resource:
      '已达到<planName/>的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请<a>联系我们</a>。',
    scopes_per_resource_other:
      '已达到<planName/>的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请<a>联系我们</a>。',
    custom_domain:
      '通过升级到付费计划解锁自定义域功能和一系列高级福利。如需任何帮助，请<a>联系我们</a>。',
    social_connectors:
      '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    social_connectors_other:
      '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    standard_connectors_feature:
      '升级到付费计划以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器，并获得无限社交连接器和所有高级功能。如需任何帮助，请<a>联系我们</a>。',
    standard_connectors:
      '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    standard_connectors_other:
      '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    standard_connectors_pro:
      '已达到<planName/>的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    standard_connectors_pro_other:
      '已达到<planName/>的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
    roles:
      '已达到<planName/>的{{count, number}}个角色限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
    roles_other:
      '已达到<planName/>的{{count, number}}个角色限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
    scopes_per_role:
      '已达到<planName/>的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
    scopes_per_role_other:
      '已达到<planName/>的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
    hooks:
      '已达到<planName/>的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请<a>联系我们</a>。',
    hooks_other:
      '已达到<planName/>的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请<a>联系我们</a>。',
  },
  mau_exceeded_modal: {
    title: 'MAU 超过限制，请升级您的计划。',
    notification:
      '您当前的 MAU 已超过<planName/>的限制。请立即升级到高级计划，以避免 Logto 服务的暂停。',
    update_plan: '更新计划',
  },
  payment_overdue_modal: {
    title: '账单逾期未付',
    notification:
      '糟糕！租户<span>{{name}}</span>的账单支付失败。请尽快支付账单，以避免Logto服务中止。',
    unpaid_bills: '未付账单',
    update_payment: '更新支付',
  },
};

export default upsell;
