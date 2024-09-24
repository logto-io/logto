const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU 是指在一个计费周期内与 Logto 交换过至少一个令牌的唯一用户。Pro 计划无限制。<a>了解更多</a>',
  },
  organizations: {
    title: '组织',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定费用为 ${{price, number}} 。组织的数量或其活动水平不影响价格。',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定费用为 ${{price, number}} 。认证因素的数量不影响价格。',
  },
  enterprise_sso: {
    title: '企业 SSO',
    description: '{{usage}}',
    tooltip: '附加功能，每个 SSO 连接每月价格为 ${{price, number}} 。',
  },
  api_resources: {
    title: 'API 资源',
    description: '{{usage}} <span>（前三个免费）</span>',
    tooltip: '附加功能，每个资源每月价格为 ${{price, number}} 。前三个 API 资源免费。',
  },
  machine_to_machine: {
    title: '机器对机器',
    description: '{{usage}} <span>（第一个免费）</span>',
    tooltip: '附加功能，每个应用每月价格为 ${{price, number}} 。第一个机器对机器应用免费。',
  },
  tenant_members: {
    title: '租户成员',
    description: '{{usage}} <span>（前三个免费）</span>',
    tooltip: '附加功能，每个成员每月价格为 ${{price, number}} 。前三个租户成员免费。',
  },
  tokens: {
    title: '令牌',
    description: '{{usage}}',
    tooltip: '附加功能，每百万个令牌价格为 ${{price, number}} 。首百万个令牌包含在内。',
  },
  hooks: {
    title: '钩子',
    description: '{{usage}} <span>（前十个免费）</span>',
    tooltip: '附加功能，每个钩子价格为 ${{price, number}} 。前十个钩子包含在内。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果你在当前计费周期内进行任何更改，你的下一个账单可能会在更改后的第一个月稍高。它将是 ${{price, number}} 基础价格加上当前周期中的未计费使用量的附加费用，以及下一个周期的全额费用。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
