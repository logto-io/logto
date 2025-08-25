const usage = {
  status_active: '使用中',
  status_inactive: '未使用',
  limited_status_quota_description: '（前 {{quota}} 個包含在內）',
  unlimited_status_quota_description: '（包含在內）',
  disabled_status_quota_description: '（不包含在內）',
  usage_description_with_unlimited_quota: '{{usage}}<span>（無限）</span>',
  usage_description_with_limited_quota: '{{usage}}<span>（前 {{basicQuota}} 個包含在內）</span>',
  usage_description_without_quota: '{{usage}}<span>（不包含在內）</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU 是指在計費週期內至少與 Logto 交換過一次令牌的獨立用戶。專業版計劃不受限制。<a>了解更多</a>',
    tooltip_for_enterprise:
      'MAU 是在計費週期內至少與 Logto 交換過一次令牌的唯一用戶。企業計劃無限制。',
  },
  organizations: {
    title: '組織',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。價格不受組織數量或其活動水平的影響。',
    description_for_enterprise: '（包含在內）',
    tooltip_for_enterprise:
      '是否包含取決於你的方案。如果組織功能不在你的初始合約中，激活時將添加到你的賬單中。附加功能每月收費 ${{price, number}}，無論組織數量或活動如何。',
    tooltip_for_enterprise_with_numbered_basic_quota:
      '你的方案包含前 {{basicQuota}} 個組織免費使用。如果你需要更多，可以以每月固定費用 ${{price, number}} 添加組織附加功能，無論組織的數量或活動水平。',
  },
  mfa: {
    title: '多重身份驗證',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。價格不受使用身份驗證因素數量的影響。',
    tooltip_for_enterprise:
      '是否包含取決於你的方案。如果多重身份驗證功能不在你的初始合約中，激活時將添加到你的賬單中。附加功能每月收費 ${{price, number}}，無論身份驗證因素的數量。',
  },
  enterprise_sso: {
    title: '企業單一登入',
    tooltip: '附加功能，每個 SSO 連接每月 ${{price, number}}。',
    tooltip_for_enterprise:
      '附加功能，每個 SSO 連接每月 ${{price, number}}。合同方案中包含前 {{basicQuota}} 個 SSO 免費使用。',
  },
  api_resources: {
    title: 'API 資源',
    tooltip: '附加功能，每個資源每月 ${{price, number}}。前三個 API 資源免費。',
    tooltip_for_enterprise:
      '合同方案中包含前 {{basicQuota}} 個 API 資源免費使用。如果你需要更多，每個 API 資源每月 ${{price, number}}。',
  },
  machine_to_machine: {
    title: '機器對機器',
    tooltip: '附加功能，每個應用每月 ${{price, number}}。首個機器對機器應用免費。',
    tooltip_for_enterprise:
      '合同方案中首個機器對機器應用免費使用。如果你需要更多，每個應用每月 ${{price, number}}。',
  },
  tenant_members: {
    title: '租戶成員',
    tooltip: '附加功能，每位成員每月收費 ${{price, number}}。前 {{count}} 名租戶成員免費。',
    tooltip_one: '附加功能，每位成員每月收費 ${{price, number}}。第 {{count}} 名租戶成員免費。',
    tooltip_other: '附加功能，每位成員每月收費 ${{price, number}}。前 {{count}} 名租戶成員免費。',
    tooltip_for_enterprise:
      '合同方案中包含前 {{basicQuota}} 個租戶成員免費使用。如果你需要更多，每個租戶成員每月 ${{price, number}}。',
  },
  tokens: {
    title: '令牌',
    tooltip:
      '附加功能，每 {{tokenLimit}} 令牌 ${{price, number}}。前 {{basicQuota}} 令牌包含在內。',
    tooltip_for_enterprise:
      '合同方案中包含前 {{basicQuota}} 個令牌免費使用。如果你需要更多，每 {{tokenLimit}} 令牌每月 ${{price, number}}。',
  },
  hooks: {
    title: '鉤子',
    tooltip: '附加功能，每個鉤子 ${{price, number}}。前十個鉤子包含在內。',
    tooltip_for_enterprise:
      '合同方案中包含前 {{basicQuota}} 個鉤子免費使用。如果你需要更多，每個鉤子每月 ${{price, number}}。',
  },
  security_features: {
    title: '進階安全性',
    tooltip:
      '附加功能，完整的進階安全包每月 ${{price, number}}，包括人機驗證、標識符鎖定、郵件黑名單等。',
  },
  saml_applications: {
    title: 'SAML 應用',
    tooltip: '附加功能，每個 SAML 應用每月 ${{price, number}}。',
  },
  third_party_applications: {
    title: '第三方應用',
    tooltip: '附加功能，每個應用每月 ${{price, number}}。',
  },
  rbacEnabled: {
    title: '角色',
    tooltip: '附加功能，每月固定費率 ${{price, number}}。價格不受全局角色數量影響。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果在當前計費週期內進行任何變更，下一個月的賬單可能會稍微高一些。它將是 ${{price, number}} 的基礎價格，加上來自當前週期的未計費使用的附加費用，以及下個週期的全額收費。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
