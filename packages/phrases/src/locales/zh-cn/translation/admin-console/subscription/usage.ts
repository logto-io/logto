const usage = {
  status_active: '使用中',
  status_inactive: '未使用',
  limited_status_quota_description: '（前 {{quota}} 个已包含）',
  unlimited_status_quota_description: '（已包含）',
  disabled_status_quota_description: '（未包含）',
  usage_description_with_unlimited_quota: '{{usage}}<span>（无限制）</span>',
  usage_description_with_limited_quota: '{{usage}}<span>（前 {{basicQuota}} 个已包含）</span>',
  usage_description_without_quota: '{{usage}}<span>（未包含）</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU 是指在一个计费周期内与 Logto 交换过至少一个令牌的唯一用户。Pro 计划无限制。<a>了解更多</a>',
    tooltip_for_enterprise:
      'MAU 是指在一个计费周期内与 Logto 交换过至少一个令牌的唯一用户。企业计划无限制。',
  },
  organizations: {
    title: '组织',
    tooltip: '附加功能，每月固定费用为 ${{price, number}} 。组织的数量或其活动水平不影响价格。',
    description_for_enterprise: '（已包含）',
    tooltip_for_enterprise:
      '根据你的计划而定。如果组织功能不在你的初始合同中，当你激活它时，将会添加到你的账单中。附加费用为 ${{price, number}}/月，无论组织的数量或活动如何。',
    tooltip_for_enterprise_with_numbered_basic_quota:
      '你的计划包括前 {{basicQuota}} 个组织免费。如果需要更多，可以按月以每月 ${{price, number}} 的固定价格添加组织，不管组织的数量或活动水平如何。',
  },
  mfa: {
    title: 'MFA',
    tooltip: '附加功能，每月固定费用为 ${{price, number}} 。认证因素的数量不影响价格。',
    tooltip_for_enterprise:
      '根据你的计划而定。如果 MFA 功能不在你的初始合同中，当你激活它时，将会添加到你的账单中。附加费用为 ${{price, number}}/月，不受使用的认证因素数量影响。',
  },
  enterprise_sso: {
    title: '企业 SSO',
    tooltip: '附加功能，每个 SSO 连接每月价格为 ${{price, number}} 。',
    tooltip_for_enterprise:
      '附加功能，每个 SSO 连接每月价格为 ${{price, number}}。合同计划包括前 {{basicQuota}} 个 SSO，免费使用。',
  },
  api_resources: {
    title: 'API 资源',
    tooltip: '附加功能，每个资源每月价格为 ${{price, number}} 。前三个 API 资源免费。',
    tooltip_for_enterprise:
      '合同计划包括前 {{basicQuota}} 个 API 资源，免费使用。如果需要更多，每个 API 资源每月 ${{price, number}}。',
  },
  machine_to_machine: {
    title: '机器对机器',
    tooltip: '附加功能，每个应用每月价格为 ${{price, number}} 。第一个机器对机器应用免费。',
    tooltip_for_enterprise:
      '合同计划包括第一个 {{basicQuota}} 个机器对机器应用，免费使用。如果需要更多，每个应用每月 ${{price, number}}。',
  },
  tenant_members: {
    title: '租户成员',
    tooltip: '附加功能，每个成员每月定价为 ${{price, number}} 。首 {{count}} 个租户成员免费。',
    tooltip_one: '附加功能，每个成员每月 ${{price, number}} 。首个租户成员（{{count}} 个）免费。',
    tooltip_other: '附加功能，每个成员每月 ${{price, number}} 。首 {{count}} 个租户成员免费。',
    tooltip_for_enterprise:
      '合同计划包括前 {{basicQuota}} 个租户成员，免费使用。如果需要更多，每个租户成员每月 ${{price, number}}。',
  },
  tokens: {
    title: '令牌',
    tooltip:
      '附加功能，每 {{tokenLimit}} 个令牌价格为 ${{price, number}} 。首 {{basicQuota}} 个令牌包含在内。',
    tooltip_for_enterprise:
      '合同计划包括首 {{basicQuota}} 个令牌，免费使用。如果需要更多，每 {{tokenLimit}} 个令牌每月 ${{price, number}}。',
  },
  hooks: {
    title: '钩子',
    tooltip: '附加功能，每个钩子价格为 ${{price, number}} 。前十个钩子包含在内。',
    tooltip_for_enterprise:
      '合同计划包括前 {{basicQuota}} 个钩子，免费使用。如果需要更多，每个钩子每月 ${{price, number}}。',
  },
  security_features: {
    title: '高级安全',
    tooltip:
      '附加功能，完整的高级安全套件每月价格为 ${{price, number}}，包括 CAPTCHA、标识符锁定、电子邮件黑名单等。',
  },
  saml_applications: {
    title: 'SAML 应用',
    tooltip: '附加功能，每个 SAML 应用每月价格为 ${{price, number}} 。',
  },
  third_party_applications: {
    title: '第三方应用',
    tooltip: '附加功能，每个应用每月价格为 ${{price, number}} 。',
  },
  rbacEnabled: {
    title: '角色',
    tooltip: '附加功能，每月费用为 ${{price, number}} 的固定价格。价格不受全局角色数量的影响。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果你在当前计费周期内进行任何更改，你的下一个账单可能会在更改后的第一个月稍高。它将是 ${{price, number}} 基础价格加上当前周期中的未计费使用量的附加费用，以及下一个周期的全额费用。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
